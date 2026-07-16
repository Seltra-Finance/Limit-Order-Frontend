import type { TocEntry } from "@/docs/content";

export function DocsToc({ toc }: { toc: TocEntry[] }) {
  if (toc.length < 2) return null;
  return (
    <nav className="docs-toc" aria-label="On this page">
      <span className="docs-toc-title">On this page</span>
      <ul>
        {toc.map((entry) => (
          <li key={entry.id} className={entry.depth === 3 ? "depth-3" : ""}>
            <a href={`#${entry.id}`}>{entry.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
