import os
import json
from flask import Flask, request, jsonify 
from dotenv import load_dotenv
from google import genai
from google.genai import types
import asyncio
from flask_cors import CORS

# Load environment variables
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create Flask app
app = Flask(__name__)
CORS(app)


# Define the asynchronous translate function
async def translate_response(words, context, language):
    prompt= f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys: translation, definition, explanation, synonyms.
            The description of the keys are as follows:\n
            Translation:\n
                - Format: "Translation: <the closest, context-aware translation of the target text> 
            Definition:\n
                - Format: "Definition: <the definition of the word in the target language>"\n
            Explanation:\n
                - Format: "Explanation: <a concise explanation of the translation/definition based on the context>"\n
            Synonyms:\n
                - Format: "Synonyms: <a short list of up to 3 synonyms or near-equivalents>"\n
            
            -If the target text is a phrase that's too long to have its own definition, provide 'X' in the key.\n 

            -If the language of the target text is the same as the target language, provide 'X' in the key.\n 
            
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
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=True)
