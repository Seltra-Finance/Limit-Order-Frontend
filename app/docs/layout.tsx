import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/docs-shell";

export const metadata: Metadata = {
  title: {
    template: "%s — Seltra Docs",
    default: "Seltra Docs",
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
