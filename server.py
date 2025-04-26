import os
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types 
from mcp import ClientSession, StdioServerParameters
from mcp.server.lowlevel.server import Server
from mcp.server.lowlevel.tool import Tool
from mcp.client.stdio import stdio_client

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

load_dotenv()

server_params = StdioServerParameters(
    command="mcp-translate-service",
    args=["--connection_type", "stdio"],
    env={},
)

# Define the asynchronous translate function
async def translate_response(words, context, language):
    prompt= f"""You are a translation assistant. 
            You will be given a word or phrase in any language and its surrounding context.
            Your task is to provide a concise JSON response in a target language given by the user
            with the keys in this order: translation, explanation, synonyms.
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