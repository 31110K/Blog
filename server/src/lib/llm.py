import os
from google import genai
from typing import List, Dict

# Initialize Gemini client using environment variable
_api_key = os.environ["GOOGLE_API_KEY"]
if not _api_key:
    raise RuntimeError("Missing GOOGLE_API_KEY environment variable for Gemini client")

client = genai.Client(api_key=_api_key)

SYSTEM_PROMPT = """
You are a helpful, concise, and friendly AI assistant.
Answer clearly and correctly.
"""


def _build_prompt(messages: List[Dict[str, str]]) -> str:
    """Build a single string prompt for the LLM from a list of messages.

    messages: list of dicts like {"role": "user"|"assistant", "content": "..."}
    """
    prompt = SYSTEM_PROMPT.strip() + "\n\n"

    for msg in messages:
        role = "User" if msg.get("role") == "user" else "Assistant"
        content = msg.get("content") or ""
        prompt += f"{role}: {content}\n"

    return prompt


def chat_with_gemini(messages: List[Dict[str, str]]) -> str:
    """Send messages to Gemini and return the assistant text reply.

    Returns a string reply. On error, returns a helpful error message string.
    """
    prompt = _build_prompt(messages)

    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt,
        )

        # Safely extract text parts
        try:
            parts = response.candidates[0].content.parts
            final_text = "".join(
                getattr(part, "text", "") for part in parts
            )
            return final_text.strip()
        except Exception:
            # Fallback: try other shapes
            try:
                # Some SDK responses may have `candidates[0].content` as a string
                return str(response.candidates[0].content).strip()
            except Exception:
                return "Sorry, I couldn't generate a response."

    except Exception as e:
        # Log the exception to server logs; don't expose sensitive details to users
        print("LLM error:", repr(e))
        return "Sorry, I couldn't reach the LLM service right now." 
