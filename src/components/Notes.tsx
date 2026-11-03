import { setNote, useStore } from "../lib/store";

export function Notes({
  slug,
  title = "Your notes",
  wordTarget,
  placeholder,
}: {
  slug: string;
  title?: string;
  wordTarget?: number;
  placeholder?: string;
}) {
  const { notes } = useStore();
  const value = notes[slug] ?? "";
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <section className="notes">
      <div className="notes-head">
        <h3>{title}</h3>
        <span className={`notes-count ${wordTarget && words > wordTarget * 2 ? "notes-over" : ""}`}>
          {words} words
          {wordTarget ? ` · target ~${wordTarget}` : ""}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setNote(slug, e.target.value)}
        rows={7}
        placeholder={
          placeholder ??
          "Write it in your own words. Autosaved on this device, and synced when you sign in."
        }
      />
      <p className="notes-meta">
        Autosaved on this device, and synced when you sign in.
        {wordTarget
          ? " Module 13 asks you to compare this against your later answer."
          : ""}
      </p>
    </section>
  );
}
