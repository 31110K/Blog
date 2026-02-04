import os
from google import genai

# Make sure your API key is set in environment:
# export GEMINI_API_KEY="your_key_here"

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def chat_with_gemini(messages):
    """
    messages = [{"role":"user","content":"hello"}]
    returns plain text reply
    """

    # Convert messages into prompt text
    prompt = ""
    for msg in messages:
        if msg["role"] == "user":
            prompt += msg["content"] + "\n"

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    return response.text
