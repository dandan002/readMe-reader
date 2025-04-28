from http.server import BaseHTTPRequestHandler
import os
import json
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types
from groq import AsyncGroq
from urllib.parse import parse_qs

# Import your functions from the backend
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.client import create_prompt, GOOGLE_MODELS, GROQ_MODELS

# Load environment
load_dotenv()

# Instantiate clients
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

async def translate_with_gemini(model, words, context, language):
    prompt = create_prompt(model, words, context, language)
    resp = gemini_client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.0,
            tools=[],
        ),
    )
    txt = resp.text.strip()
    if txt.startswith("```json"):
        txt = txt.removeprefix("```json").removesuffix("```").strip()
    elif txt.startswith("```"):
        txt = txt.removeprefix("```").removesuffix("```").strip()
    return txt

async def translate_with_groq(model, words, context, language):
    prompt = create_prompt(model, words, context, language)
    chat = await groq_client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": prompt}],
        temperature=0.0,
        max_completion_tokens=324,
        response_format={"type": "json_object"},
    )
    return chat.choices[0].message.content.strip()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        model = data.get("model")
        target_words = data.get("target_words")
        context = data.get("context")
        target_language = data.get("target_language")

        if not all([model, target_words, context, target_language]):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
            return

        try:
            if model in GOOGLE_MODELS:
                coroutine = translate_with_gemini(model, target_words, context, target_language)
            elif model in GROQ_MODELS:
                coroutine = translate_with_groq(model, target_words, context, target_language)
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Unsupported model '{model}'"}).encode())
                return

            assistant_output = asyncio.run(coroutine)
            result = json.loads(assistant_output)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except json.JSONDecodeError:
            self.send_response(502)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Unable to parse model output as JSON",
                "raw": assistant_output
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())