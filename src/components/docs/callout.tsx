import { AlertTriangle, CircleAlert, Info, Lightbulb } from "lucide-react";

type CalloutType = "info" | "warning" | "danger" | "success";

const icons: Record<CalloutType, React.ReactNode> = {
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />,
  danger: <CircleAlert size={16} />,
  success: <Lightbulb size={16} />,
};

/** Highlighted hint/warning block used throughout the docs content. */
export function Callout({ type = "info", children }: { type?: CalloutType; children: React.ReactNode }) {
  return (
    <aside className={`docs-callout docs-callout-${type}`} role="note">
      <span className="docs-callout-icon" aria-hidden="true">{icons[type]}</span>
      <div className="docs-callout-body">{children}</div>
    </aside>
  );
}
