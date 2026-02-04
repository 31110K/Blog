import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def chat_with_gemini(messages):
    prompt = ""
    for msg in messages:
        if msg["role"] == "user":
            prompt += msg["content"] + "\n"

    response = client.models.generate_content(
        model="gemini-2.5-flash",   # ✅ FIXED MODEL
        contents=prompt
    )

    return response.text
