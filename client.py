from google import genai
from google.genai import types
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
#manages communication between client/server  and stdio allows in diff enviroments 
from mcp import ClientSession, StdioServerParameters
#asyncronous context manager ensures client/server interaction is ready 
from mcp.client.stdio import stdio_client
import asyncio


load_dotenv()   

app = Flask(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

server_params = StdioServerParameters(
    command="mcp-translate-service",
    args=["--connection_type", "stdio"],
    env={},
)

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json() # gets json file
    words = data.get("words") 
    context = data.get("context")
    language = data.get("language")

    if not words or not context or not language:
        return jsonify({"error": "Missing required fields"}), 400
    

    # Call the translation function
    gemini_response = asyncio.run(translate_response(words, context, language))

    return jsonify({"translation": gemini_response})

async def translate_response(words, paragraphs, language):
    prompt= f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys: translation, explanation, synonyms.
            The description of the keys are as follows:\n
            translation: the closest, context-aware translation\n
            explanation: a concise explanation of why you chose that translation\n
            synonyms: a short list of up to 3 synonyms or near-equivalents\n
            The following is the user input:\n
            Give me a translation of {words} into {language}. This was used in the following context: {paragraphs}"""
        
    response = client.models.generate_content(
        model="gemini-2.5-pro-exp-03-25",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0,
            tools=[],
        ),
    )
    
    return response.text



# async def run(): 
#     # async with stdio_client(server_params) as (read, write):
#     #     async with ClientSession(read, write) as session:
#     gemini_response = await translate_response("Hello", "I am a student", "French")
#     print(gemini_response)
        #     await session.initialize()
        #     # Remove debug prints

        #     mcp_tools = await session.list_tools()
        #     # Remove debug prints
        #     tools = [
        #         types.Tool(
        #             function_declarations=[
        #                 {
        #                     "name": tool.name,
        #                     "description": tool.description,
        #                     "parameters": {
        #                         k: v
        #                         for k, v in tool.inputSchema.items()
        #                         if k not in ["additionalProperties", "$schema"]
        #                     },
        #                 }
        #             ]
        #         )
        #         for tool in mcp_tools.tools
        #     ]
        #     # Remove debug prints

        #     # where it calls gemini and gives it the prompt
        #     response = await client.models.generate_content(
        #         model="gemini-2.5-pro-exp-03-25",
        #         contents=prompt,
        #         config=types.GenerateContentConfig(
        #             temperature=0,
        #             tools=tools,
        #         ),
        #     )


        # print(response.text)


if __name__ == "__main__":
    # asyncio.run(run())
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")), debug=True)