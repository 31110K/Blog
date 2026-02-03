#!/usr/bin/env python3
import sys
import json


def main():
    # Try to import the LLM helper; if missing, return a JSON error message
    try:
        from llm import chat_with_gemini
    except ModuleNotFoundError as e:
        err_msg = (
            "Missing Python dependency for LLM: 'google-generative-ai'. "
            "Install it with `pip install -r server/requirements.txt` in your deployment environment."
        )
        out = {"success": False, "error": err_msg}
        # Print JSON to stdout so the Node process can read it, and exit 0 so child_process doesn't raise.
        sys.stdout.write(json.dumps(out))
        sys.exit(0)
    except Exception as e:
        out = {"success": False, "error": f"LLM import error: {str(e)}"}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    # Accept prompt either as first CLI arg or JSON on stdin
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
