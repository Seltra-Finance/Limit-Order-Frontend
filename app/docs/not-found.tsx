import Link from "next/link";

export default function DocsNotFound() {
  return (
    <article className="docs-article docs-not-found">
      <h1>Page not found</h1>
      <p>That documentation page doesn&apos;t exist. It may have moved during a docs reorganization.</p>
      <p>
        <Link href="/docs">Back to the documentation home</Link>
      </p>
    </article>
  );
}
