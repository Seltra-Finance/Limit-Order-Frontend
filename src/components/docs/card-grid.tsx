/** Responsive feature-card grid for docs landing pages. */
export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="docs-card-grid">{children}</div>;
}

export function Card({ icon, title, children }: { icon?: string; title: string; children: React.ReactNode }) {
  return (
    <article className="docs-card">
      {icon ? (
        <span className="docs-card-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h4>{title}</h4>
      <p>{children}</p>
    </article>
  );
}
