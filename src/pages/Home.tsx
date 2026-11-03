import { firstModule, modules, readyModules } from "../content";
import { PARTS } from "../content/types";
import { useStore } from "../lib/store";

function ContinueCard() {
  const { progress } = useStore();
  const target =
    readyModules.find(
      (m) => (progress[m.slug] ?? []).length < m.stages.length,
    ) ?? firstModule;

  if (!target) return null;

  const done = (progress[target.slug] ?? []).length;
  return (
    <a className="continue" href={`#/m/${target.slug}`}>
      <span className="continue-label">
        {done === 0 ? "Start here" : "Continue"}
      </span>
      <span className="continue-title">
        {String(target.number).padStart(2, "0")} · {target.title}
      </span>
      <span className="continue-promise">{target.promise}</span>
      <span className="continue-meta">
        {target.minutes} min · {target.stages.length} stages
      </span>
    </a>
  );
}

export function Home() {
  const { progress } = useStore();

  return (
    <div className="page home">
      <header className="hero">
        <p className="eyebrow">A course, not a notes dump</p>
        <h1>
          System design is <em>arithmetic</em>,
          <br />
          not boxes on a whiteboard.
        </h1>
        <p className="hero-lede">
          Every system is a negotiation between three constraints —{" "}
          <b>physics</b> (latency, capacity), <b>economics</b> (cost per
          request), and <b>coordination</b> (ordering, consistency, failure).
          Design is choosing which one to violate, and knowing who pays.
        </p>
        <p className="hero-lede hero-lede-sub">
          Thirteen modules build the reasoning. Five drills put you in the chair.
          Every stage asks you to produce a number, break something, or defend a
          tradeoff — because that is what the interview actually tests.
        </p>
      </header>

      <ContinueCard />

      <section className="loop">
        <h2>The loop</h2>
        <p className="section-lede">
          Each module runs the same six movements. The repetition is the point:
          the loop becomes the habit you use in a design review.
        </p>
        <ol className="loop-list">
          {[
            ["Intuition", "The one mental model, stated plainly."],
            ["Derive", "One worked number, by hand. No hand-waving."],
            ["Play", "A live model. Drag the inputs, watch the system bend."],
            ["Break", "Inject failure or 10× traffic. Predict first."],
            ["Decide", "A forced tradeoff, written as a four-line ADR."],
            ["Say it", "The 150-word answer you'd give out loud."],
          ].map(([title, body], i) => (
            <li key={title}>
              <span className="loop-num">{i + 1}</span>
              <div>
                <b>{title}</b>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="curriculum">
        <h2>The curriculum</h2>
        {PARTS.map((part) => (
          <div className="part-block" key={part.id}>
            <div className="part-head">
              <span className="part-label">{part.label}</span>
              <div>
                <h3>{part.title}</h3>
                <p>{part.blurb}</p>
              </div>
            </div>
            <div className="module-grid">
              {modules
                .filter((m) => m.part === part.id)
                .map((m) => {
                  const done = (progress[m.slug] ?? []).length;
                  const complete =
                    m.ready && m.stages.length > 0 && done >= m.stages.length;
                  return (
                    <a
                      key={m.slug}
                      href={`#/m/${m.slug}`}
                      className={[
                        "module-card",
                        complete ? "module-card-done" : "",
                        !m.ready ? "module-card-locked" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="module-card-num">
                        {complete ? "✓" : String(m.number).padStart(2, "0")}
                      </span>
                      <span className="module-card-title">{m.title}</span>
                      <span className="module-card-promise">
                        {m.ready ? m.promise : "In the next batch"}
                      </span>
                    </a>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      <section className="arena-cta">
        <div>
          <p className="eyebrow">Part V</p>
          <h2>The Arena</h2>
          <p>
            A 45-minute clock, five gates, and a rubric scored on framing,
            numbers, tradeoffs, failure, and cost. The same rubric a Senior EM or
            Principal loop uses — including the two axes most candidates never
            practise.
          </p>
        </div>
        <a className="btn btn-primary" href="#/arena">
          Open the Arena →
        </a>
      </section>

      <footer className="page-footer">
        <p>
          Built on the shoulders of Kleppmann, Dean &amp; Barroso, Google SRE, and{" "}
          <a
            href="https://github.com/liquidslr/system-design-notes"
            target="_blank"
            rel="noopener noreferrer"
          >
            liquidslr/system-design-notes
          </a>
          . Sources are linked inside every module.
        </p>
      </footer>
    </div>
  );
}
