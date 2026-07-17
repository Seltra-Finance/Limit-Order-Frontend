import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { allDocPages, routeForSlug, type DocPage } from "@/docs/navigation";

export function DocsPagination({ current }: { current: DocPage }) {
  const index = allDocPages.findIndex((page) => page.slug === current.slug);
  const prev = index > 0 ? allDocPages[index - 1] : null;
  const next = index >= 0 && index < allDocPages.length - 1 ? allDocPages[index + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav className="docs-pagination" aria-label="Page navigation">
      {prev ? (
        <Link className="docs-page-link prev" href={routeForSlug(prev.slug)} rel="prev">
          <span className="docs-page-dir"><ArrowLeft size={13} /> Previous</span>
          <span className="docs-page-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="docs-page-link next" href={routeForSlug(next.slug)} rel="next">
          <span className="docs-page-dir">Next <ArrowRight size={13} /></span>
          <span className="docs-page-title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
