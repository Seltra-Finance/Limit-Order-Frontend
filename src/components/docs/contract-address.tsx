"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

const EXPLORER = "https://testnet.snowtrace.io";

/** Monospace address with copy + Snowtrace link, used on deployment pages. */
export function ContractAddress({ address, label }: { address: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <span className="docs-address">
      {label ? <span className="docs-address-label">{label}</span> : null}
      <code>{address}</code>
      <button type="button" onClick={copy} aria-label={copied ? "Copied" : `Copy ${label ?? "address"}`}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
      <a href={`${EXPLORER}/address/${address}`} target="_blank" rel="noreferrer" aria-label={`${label ?? address} on Snowtrace`}>
        <ExternalLink size={12} />
      </a>
    </span>
  );
}
