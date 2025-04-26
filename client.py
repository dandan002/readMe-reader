import os
import json
from flask import Flask, request, jsonify 
from dotenv import load_dotenv
from google import genai
from google.genai import types
import asyncio

# Load environment variables
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create Flask app
app = Flask(__name__)


# Define the asynchronous translate function
async def translate_response(words, context, language):
    prompt= f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys: translation, explanation, synonyms.
            The description of the keys are as follows:\n
            translation: the closest, context-aware translation\n
            explanation: a concise explanation of why you chose that translation\n
            synonyms: a short list of up to 3 synonyms or near-equivalents\n
            The following is the user input:\n
            Give me a translation of {words} into {language}. This was used in the following context: {context}"""
        
    response = client.models.generate_content(
                model="gemini-2.5-pro-exp-03-25",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    tools=[],
                ),
            )
    return response

# Define the /translate POST route
@app.route("/translate", methods=["POST"])
def translate():
    payload = request.get_json(force=True)
    target_words = payload.get("target_words")
    context = payload.get("context")
    target_language = payload.get("target_language")

    if not target_words or not context or not target_language:
        return jsonify({"error": "Missing required fields"}), 400

     
    try:
        gemini_response = asyncio.run(translate_response(target_words, context, target_language)) 

        # response.text contains the raw assistant reply 
        assistant_output = gemini_response.text.strip() 
        if assistant_output.startswith("```json"): 
            assistant_output = assistant_output.replace("```json", "").replace("```", "").strip() 
        elif assistant_output.startswith("```"):
            assistant_output = assistant_output.replace("```", "").strip() 

        result = json.loads(assistant_output)
    except json.JSONDecodeError: 
        return jsonify({
            "error": "Unable to parse model output as JSON",
            "raw": assistant_output
        }), 502
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

    return jsonify(result)


    

# Start the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")), debug=True)
