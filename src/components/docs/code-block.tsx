"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

/** Wraps rehype-pretty-code's <pre> output with a copy button. */
export function CodePre(props: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/http): leave the button as-is.
    }
  }

  return (
    <div className="docs-pre-wrap">
      <button className="docs-copy" type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <pre ref={preRef} {...props} />
    </div>
  );
}
