import { modules, readyModules } from "../content";
import { PARTS } from "../content/types";
import { useStore } from "../lib/store";
import { useSession } from "../lib/supabase";

function CourseProgress() {
  const { progress } = useStore();
  const total = readyModules.reduce((n, m) => n + m.stages.length, 0);
  const done = readyModules.reduce(
    (n, m) =>
      n +
      m.stages.filter((s) => (progress[m.slug] ?? []).includes(s.id)).length,
    0,
  );
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="course-progress">
      <div className="course-progress-row">
        <span>{done} / {total} stages</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Shell({
  children,
  route,
}: {
  children: React.ReactNode;
  route: string;
}) {
  const { progress } = useStore();
  const session = useSession();

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#/">
          <span className="brand-mark">sd</span>
          <span className="brand-text">
            System Design
            <small>from first principles</small>
          </span>
        </a>

        <CourseProgress />

        <nav className="nav">
          {PARTS.map((part) => (
            <div className="nav-group" key={part.id}>
              <p className="nav-group-label">
                {part.label} · {part.title}
              </p>
              {modules
                .filter((m) => m.part === part.id)
                .map((m) => {
                  const done = (progress[m.slug] ?? []).length;
                  const complete =
                    m.ready && done >= m.stages.length && m.stages.length > 0;
                  return (
                    <a
                      key={m.slug}
                      href={`#/m/${m.slug}`}
                      className={[
                        "nav-item",
                        route === `/m/${m.slug}` ? "nav-item-active" : "",
                        !m.ready ? "nav-item-locked" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="nav-num">
                        {complete ? "✓" : String(m.number).padStart(2, "0")}
                      </span>
                      <span className="nav-title">{m.title}</span>
                    </a>
                  );
                })}
            </div>
          ))}

          <div className="nav-group">
            <p className="nav-group-label">Part V · Interview</p>
            <a
              className={`nav-item ${route === "/arena" ? "nav-item-active" : ""}`}
              href="#/arena"
            >
              <span className="nav-num">45</span>
              <span className="nav-title">The Arena</span>
            </a>
          </div>
        </nav>

        <a className="sidebar-footer" href="#/settings">
          {session?.user.email ?? "Local progress · sign in to sync"}
        </a>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
