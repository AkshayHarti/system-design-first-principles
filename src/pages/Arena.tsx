import { useEffect, useMemo, useState } from "react";
import { AXES, GATES, PROMPTS, type Prompt } from "../content/arena";
import { addAttempt, useStore } from "../lib/store";

const TOTAL_SECONDS = 45 * 60;

function clock(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function band(total: number): { label: string; tone: string } {
  if (total >= 17) return { label: "Strong staff-level signal", tone: "good" };
  if (total >= 13) return { label: "Solid senior — tighten cost and ownership", tone: "ok" };
  if (total >= 9) return { label: "Works, but still sounds like a tutorial", tone: "warn" };
  return { label: "Needs another pass before it counts", tone: "bad" };
}

export function Arena() {
  const { attempts } = useStore();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gates, setGates] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState<number | null>(null);

  useEffect(() => {
    if (startedAt === null) return;
    const tick = () =>
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const currentGate = useMemo(() => {
    const minutes = elapsed / 60;
    let active = GATES[0];
    for (const gate of GATES) if (minutes >= gate.atMinute) active = gate;
    return active;
  }, [elapsed]);

  const totalScore = AXES.reduce((n, a) => n + (scores[a.id] ?? 0), 0);
  const scored = AXES.every((a) => scores[a.id] !== undefined);
  const over = elapsed > TOTAL_SECONDS;

  function start(p: Prompt) {
    setPrompt(p);
    setStartedAt(Date.now());
    setElapsed(0);
    setGates([]);
    setScores({});
    setNotes("");
    setSubmitted(null);
  }

  function submit() {
    if (!prompt || startedAt === null) return;
    addAttempt({
      id: crypto.randomUUID(),
      promptId: prompt.id,
      startedAt,
      submittedAt: Date.now(),
      scores,
      notes,
    });
    setSubmitted(totalScore);
    setStartedAt(null);
  }

  function exportMarkdown() {
    if (!prompt) return;
    const lines = [
      `# ${prompt.title}`,
      "",
      `Took: ${clock(elapsed)}`,
      "",
      "## Notes",
      notes,
      "",
      "## Rubric",
      ...AXES.map((a) => `- ${a.label}: ${scores[a.id] ?? 0}/4`),
      "",
      `Total: ${totalScore}/20`,
    ];
    void navigator.clipboard.writeText(lines.join("\n"));
  }

  if (!prompt) {
    return (
      <div className="page arena">
        <header className="module-head">
          <p className="eyebrow">Part V · Interview</p>
          <h1>The Arena</h1>
          <p className="module-promise">
            45 minutes, five gates, twenty points. Pick a prompt and talk out
            loud — the notes box is your whiteboard.
          </p>
        </header>

        <div className="prompt-grid">
          {PROMPTS.map((p) => (
            <button key={p.id} className="prompt-card" onClick={() => start(p)}>
              <span className="prompt-title">{p.title}</span>
              <span className="prompt-brief">{p.brief}</span>
              <span className="prompt-twist">↳ {p.twist}</span>
            </button>
          ))}
        </div>

        {attempts.length > 0 && (
          <section className="attempts">
            <h2>Previous attempts</h2>
            <ul>
              {attempts.map((a) => {
                const p = PROMPTS.find((x) => x.id === a.promptId);
                const score = Object.values(a.scores).reduce((n, v) => n + v, 0);
                return (
                  <li key={a.id}>
                    <span>{p?.title ?? a.promptId}</span>
                    <span className="attempts-meta">
                      {new Date(a.submittedAt).toLocaleDateString()} ·{" "}
                      {clock(Math.round((a.submittedAt - a.startedAt) / 1000))} ·{" "}
                      {score}/20
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="page arena arena-live">
      <div className="arena-bar">
        <div>
          <p className="eyebrow">Live attempt</p>
          <h1 className="arena-title">{prompt.title}</h1>
        </div>
        <div className={`timer ${over ? "timer-over" : ""}`}>
          {clock(TOTAL_SECONDS - elapsed)}
          <span>{elapsed > TOTAL_SECONDS ? "over" : "remaining"}</span>
        </div>
      </div>

      <div className="arena-layout">
        <div className="arena-side">
          <section className="gate-panel">
            <h2>Gates</h2>
            {GATES.map((gate) => {
              const checked = gates.includes(gate.id);
              const isCurrent = currentGate.id === gate.id;
              return (
                <label
                  key={gate.id}
                  className={[
                    "gate",
                    isCurrent ? "gate-current" : "",
                    checked ? "gate-checked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setGates((g) =>
                        checked
                          ? g.filter((id) => id !== gate.id)
                          : [...g, gate.id],
                      )
                    }
                  />
                  <span className="gate-body">
                    <span className="gate-time">
                      {String(gate.atMinute).padStart(2, "0")}′ · {gate.label}
                    </span>
                    <span className="gate-detail">{gate.detail}</span>
                  </span>
                </label>
              );
            })}
          </section>
        </div>

        <div className="arena-main">
          <div className="brief">
            <p>{prompt.brief}</p>
            <p className="brief-twist">
              <b>The twist.</b> {prompt.twist}
            </p>
          </div>

          <textarea
            className="canvas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your whiteboard. Numbers first, then the spine, then the deep dive."
            rows={14}
          />

          <section className="rubric">
            <h2>Score yourself</h2>
            <p className="section-lede">
              0 = absent, 2 = mentioned, 4 = you'd defend it to a staff engineer.
            </p>
            {AXES.map((axis) => (
              <div className="rubric-row" key={axis.id}>
                <div className="rubric-head">
                  <b>{axis.label}</b>
                  <span>{scores[axis.id] ?? 0}/4</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={scores[axis.id] ?? 0}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, [axis.id]: Number(e.target.value) }))
                  }
                />
                <p className="rubric-anchor">{axis.anchor}</p>
              </div>
            ))}

            <div className="rubric-total">
              <span>{totalScore}/20</span>
              {scored && <b className={`band band-${band(totalScore).tone}`}>
                {band(totalScore).label}
              </b>}
            </div>

            <div className="arena-actions">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setPrompt(null);
                  setStartedAt(null);
                }}
              >
                Abandon
              </button>
              <button className="btn btn-ghost" onClick={exportMarkdown}>
                Copy as markdown
              </button>
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!scored}
              >
                {submitted !== null ? "Saved ✓" : "Save attempt"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
