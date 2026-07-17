"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { docsSections, docsHome, routeForSlug } from "@/docs/navigation";

export function DocsSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Mobile drawer: Escape closes, focus moves into the nav while open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    navRef.current?.querySelector("a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [mobileOpen, onClose]);

  const link = (slug: string, title: string) => {
    const route = routeForSlug(slug);
    const current = pathname === route;
    return (
      <Link href={route} aria-current={current ? "page" : undefined} className={current ? "active" : ""} onClick={onClose}>
        {title}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen ? <div className="docs-sidebar-backdrop" onMouseDown={onClose} /> : null}
      <nav ref={navRef} className={`docs-sidebar ${mobileOpen ? "open" : ""}`} aria-label="Documentation">
        {link(docsHome.slug, docsHome.title)}
        {docsSections.map((section) => (
          <div key={section.slug} className="docs-sidebar-section">
            <span className="docs-sidebar-heading">{section.title}</span>
            {section.pages.map((page) =>
              page.slug === section.slug ? (
                <span key={page.slug} className="docs-sidebar-overview">
                  {link(page.slug, "Overview")}
                </span>
              ) : (
                <span key={page.slug}>{link(page.slug, page.title)}</span>
              ),
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
