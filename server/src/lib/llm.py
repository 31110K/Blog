import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are a blog writing assistant.

Rules for your response:
- Do not include meta commentary like "Okay, to give you the best intro" or "Here are a few options".
- Do not use markdown symbols such as **, ---, or >.
- Write in clear multiple paragraphs and points if nedded.
- Keep the tone professional and suitable for a blog editor chatbot.
"""

def chat_with_gemini(messages):
    user_prompt = ""
    for msg in messages:
        if msg["role"] == "user":
            user_prompt += msg["content"] + "\n"

    final_prompt = SYSTEM_PROMPT + "\nUser request:\n" + user_prompt

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=final_prompt
    )

    return response.text.strip()
