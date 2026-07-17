"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SeltraMark } from "@/components/seltra-mark";
import { ThemeToggle } from "@/components/theme-controls";
import { DocsSearch } from "./docs-search";
import { DocsSidebar } from "./docs-sidebar";

/**
 * Docs chrome: its own light header (not the trading terminal bar), a
 * persistent sidebar on desktop, and a drawer on mobile.
 */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="docs-shell">
      <a className="docs-skip-link" href="#docs-content">
        Skip to content
      </a>
      <header className="docs-header">
        <div className="docs-header-left">
          <button
            className="icon-button docs-nav-toggle"
            type="button"
            onClick={() => setMobileNavOpen((value) => !value)}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
          <Link className="brand" href="/docs" aria-label="Seltra documentation home">
            <SeltraMark className="brand-mark" />
            <span className="brand-word">Seltra</span>
            <span className="docs-badge">Docs</span>
          </Link>
        </div>
        <div className="docs-header-actions">
          <DocsSearch />
          <a
            className="docs-header-link"
            href="https://github.com/Seltra-Finance/Limit-Order"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
          <Link className="button accent docs-app-link" href="/trade">
            Open app <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>
      <div className="docs-body">
        <DocsSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main id="docs-content" className="docs-main">
          {children}
        </main>
      </div>
    </div>
  );
}
