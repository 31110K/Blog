#!/usr/bin/env python3
import sys
import json


def main():
    try:
        from llm import chat_with_gemini
    except ModuleNotFoundError:
        err_msg = (
            "Missing Python dependency for LLM: 'google-genai'. "
            "Install it with: pip install google-genai"
        )
        out = {"success": False, "error": err_msg}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    except Exception as e:
        out = {"success": False, "error": f"LLM import error: {str(e)}"}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    # Read prompt
    prompt = ""
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
    else:
        try:
            raw = sys.stdin.read()
            if raw:
                payload = json.loads(raw)
                prompt = payload.get("prompt") or payload.get("message") or ""
        except Exception:
            prompt = ""

    if not prompt:
        out = {"success": False, "error": "Empty prompt"}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    messages = [{"role": "user", "content": prompt}]

    try:
        reply = chat_with_gemini(messages)
        out = {"success": True, "reply": reply}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    except Exception as e:
        out = {"success": False, "error": f"LLM runtime error: {str(e)}"}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)


if __name__ == "__main__":
    main()
