"use client";

import { FileText, Search, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchRecord {
  route: string;
  title: string;
  section: string;
  heading: string;
  /** Anchor for the heading ("" for page top). */
  anchor: string;
  text: string;
}

let cachedIndex: SearchRecord[] | null = null;

async function loadIndex(): Promise<SearchRecord[]> {
  if (cachedIndex) return cachedIndex;
  const response = await fetch("/docs-search.json");
  cachedIndex = (await response.json()) as SearchRecord[];
  return cachedIndex;
}

interface Hit {
  record: SearchRecord;
  score: number;
}

function searchIndex(index: SearchRecord[], query: string): Hit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const hits: Hit[] = [];
  for (const record of index) {
    const title = record.title.toLowerCase();
    const heading = record.heading.toLowerCase();
    const text = record.text.toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (title.includes(term)) score += 8;
      else if (heading.includes(term)) score += 5;
      else if (text.includes(term)) score += 1;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) hits.push({ record, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 12);
}

function excerpt(text: string, query: string): string {
  const term = query.toLowerCase().split(/\s+/).filter(Boolean)[0] ?? "";
  const at = text.toLowerCase().indexOf(term);
  if (at < 0) return text.slice(0, 120);
  const start = Math.max(0, at - 40);
  return `${start > 0 ? "…" : ""}${text.slice(start, at + 90)}…`;
}

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    let stale = false;
    if (query.trim() === "") {
      setHits([]);
      setActive(0);
      return;
    }
    void loadIndex().then((index) => {
      if (stale) return;
      setHits(searchIndex(index, query));
      setActive(0);
    });
    return () => {
      stale = true;
    };
  }, [query]);

  function onInputKey(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && hits[active]) {
      const { record } = hits[active];
      window.location.href = record.anchor ? `${record.route}#${record.anchor}` : record.route;
      close();
    }
  }

  return (
    <>
      <button className="docs-search-button" type="button" onClick={() => setOpen(true)} aria-label="Search documentation">
        <Search size={14} />
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      {open ? (
        <div className="modal-backdrop docs-search-backdrop" onMouseDown={close}>
          <div
            className="docs-search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="docs-search-input-row">
              <Search size={15} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                placeholder="Search the docs…"
                aria-label="Search query"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
              />
              <button className="icon-button" type="button" onClick={close} aria-label="Close search">
                <X size={15} />
              </button>
            </div>
            {query.trim() !== "" ? (
              hits.length > 0 ? (
                <ul className="docs-search-results" ref={listRef}>
                  {hits.map(({ record }, index) => (
                    <li key={`${record.route}#${record.anchor}`}>
                      <Link
                        href={record.anchor ? `${record.route}#${record.anchor}` : record.route}
                        className={index === active ? "active" : ""}
                        onClick={close}
                        onMouseEnter={() => setActive(index)}
                      >
                        <FileText size={13} aria-hidden="true" />
                        <span className="docs-search-hit">
                          <strong>
                            {record.title}
                            {record.heading ? ` › ${record.heading}` : ""}
                          </strong>
                          <small>{excerpt(record.text, query)}</small>
                        </span>
                        <span className="docs-search-section">{record.section}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="docs-search-empty">No results for “{query}”.</p>
              )
            ) : (
              <p className="docs-search-empty">Type to search titles, headings, and body text.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
