#!/usr/bin/env python3
import sys
import json
from llm import chat_with_gemini


def main():
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
    reply = chat_with_gemini(messages)

    out = {"success": True, "reply": reply}
    sys.stdout.write(json.dumps(out))


if __name__ == "__main__":
    main()
