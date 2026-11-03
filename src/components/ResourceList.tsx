import { useState } from "react";
import type { Resource, ResourceKind } from "../content/types";

const KIND_LABEL: Record<ResourceKind, string> = {
  video: "Watch",
  paper: "Paper",
  blog: "Blog",
  book: "Book",
  docs: "Docs",
  code: "Code",
};

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [open, setOpen] = useState(false);
  if (!resources.length) return null;

  return (
    <section className="resources">
      <button
        className="resources-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Go deeper — {resources.length} sources</span>
        <span className="resources-caret">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <ul className="resource-list">
          {resources.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                <span className="resource-kind">{KIND_LABEL[r.kind]}</span>
                <span className="resource-title">{r.title}</span>
              </a>
              {r.note && <p className="resource-note">{r.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
