import os
import json
import asyncio
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from google import genai
from google.genai import types
from groq import AsyncGroq
from flask_cors import CORS

# Load environment
load_dotenv()

# Define which models belong to which backend
GOOGLE_MODELS = {
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
}

GROQ_MODELS = {
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.3-70b-versatile",
    "qwen-qwq-32b",
}

# Instantiate clients
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client   = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def translate_with_gemini(model: str, words: str, context: str, language: str) -> str:
    prompt = f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys: translation, definition, explanation, synonyms.
            The description of the keys are as follows:\n
            Translation:\n
                - the closest, context-aware translation of the target text\n
            Definition:\n
                - the definition of the word in the target language\n
            Explanation:\n
                - a concise explanation of the translation/definition based on the context\n
            Synonyms:\n
                - a short list of up to 3 synonyms or near-equivalents\n
            
            -If the target text is a phrase that's too long to have its own definition, provide 'X' in the definition key.\n 

            -If the language of the target text is the same as the target language, provide 'X' translation in the key.\n 
            
            Everything in the JSON response should be in the target language.\n
            The JSON response should be formatted as follows:\n
            ```json\n
            {{\n
                "translation": "<translation>",\n
                "definition": "<definition>",\n
                "explanation": "<explanation>",\n
                "synonyms": "<synonyms>"\n
            }}\n
            ```\n
            
            The following is the user input:\n
            
            Give me a translation of {words} into {language}. This was used in the following context: {context}"""
    resp = gemini_client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.0,
            tools=[],
        ),
    )
    # gemini’s .text holds the assistant reply
    txt = resp.text.strip()
    # strip any ``` wrappers
    if txt.startswith("```json"):
        txt = txt.removeprefix("```json").removesuffix("```").strip()
    elif txt.startswith("```"):
        txt = txt.removeprefix("```").removesuffix("```").strip()
    return txt

async def translate_with_groq(model: str, words: str, context: str, language: str) -> str:
    prompt = f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys: translation, definition, explanation, synonyms.
            The description of the keys are as follows:\n
            Translation:\n
                - the closest, context-aware translation of the target text\n
            Definition:\n
                - the definition of the word in the target language\n
            Explanation:\n
                - a concise explanation of the translation/definition based on the context\n
            Synonyms:\n
                - a short list of up to 3 synonyms or near-equivalents\n
            
            -If the target text is a phrase that's too long to have its own definition, provide 'X' in the definition key.\n 

            -If the language of the target text is the same as the target language, provide 'X' translation in the key.\n 
            
            Everything in the JSON response should be in the target language.\n
            The JSON response should be formatted as follows:\n
            ```json\n
            {{\n
                "translation": "<translation>",\n
                "definition": "<definition>",\n
                "explanation": "<explanation>",\n
                "synonyms": "<synonyms>"\n
            }}\n
            ```\n
            
            The following is the user input:\n
            
            Give me a translation of {words} into {language}. This was used in the following context: {context}"""
    chat = await groq_client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": prompt}],
        temperature=0.0,
        max_completion_tokens=1024,
        response_format={"type": "json_object"},
    )
    # Groq returns the JSON directly in .content
    return chat.choices[0].message.content.strip()

# Flask setup
app = Flask(__name__)
CORS(app)

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json(force=True)
    model           = data.get("model")
    target_words    = data.get("target_words")
    context         = data.get("context")
    target_language = data.get("target_language")

    if not all([model, target_words, context, target_language]):
        return jsonify({"error": "Missing required fields"}), 400

    # Decide backend
    if model in GOOGLE_MODELS:
        coroutine = translate_with_gemini(model, target_words, context, target_language)
    elif model in GROQ_MODELS:
        coroutine = translate_with_groq(model, target_words, context, target_language)
    else:
        return jsonify({"error": f"Unsupported model '{model}'"}), 400

    try:
        assistant_output = asyncio.run(coroutine)
        result = json.loads(assistant_output)
    except json.JSONDecodeError:
        return jsonify({
            "error": "Unable to parse model output as JSON",
            "raw": assistant_output
        }), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(result)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5001")),
        debug=True,
    )
