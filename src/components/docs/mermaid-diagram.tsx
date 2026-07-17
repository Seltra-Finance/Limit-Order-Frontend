"use client";

import { useEffect, useRef, useState } from "react";

let idCounter = 0;

/**
 * Client-side Mermaid rendering with a readable fallback: the diagram source
 * stays visible (and reserves space) until the SVG replaces it, so there is
 * no layout jump and errors degrade to the raw definition.
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const dark = document.documentElement.dataset.theme !== "light";
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "neutral",
          securityLevel: "strict",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        });
        const { svg } = await mermaid.render(`seltra-mermaid-${idCounter++}`, chart);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        setState("done");
      } catch {
        if (!cancelled) setState("error");
      }
    }
    void render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <figure className="docs-mermaid" data-state={state}>
      <div ref={containerRef} className="docs-mermaid-canvas" />
      {state !== "done" ? (
        <pre className="docs-mermaid-fallback" aria-label={state === "error" ? "Diagram source (failed to render)" : "Diagram source"}>
          {chart}
        </pre>
      ) : null}
    </figure>
  );
}
