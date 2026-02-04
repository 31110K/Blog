import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are a blog writing assistant.

Always format your response exactly like this:

INTRODUCTION OPTIONS

Option 1 (Beginner-Friendly):
<paragraph>

Option 2 (Problem–Solution):
<paragraph>

Option 3 (Technical & Enthusiastic):
<paragraph>

Option 4 (Short & Punchy):
<paragraph>

FOLLOW-UP QUESTIONS
1. Who is your target audience?
2. What is the main topic of your article?

Rules:
- Do not use markdown symbols like **, ---, or >
- Do not add meta explanations
- Do not say "Okay, to give you the best intro"
- Output plain clean text only
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
