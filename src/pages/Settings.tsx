import { useState } from "react";
import { sendMagicLink, signOut, useSession, authAvailable } from "../lib/supabase";
import { useStore } from "../lib/store";

export function Settings() {
  const session = useSession();
  const { progress, notes, attempts } = useStore();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stages = Object.values(progress).reduce((n, s) => n + s.length, 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await sendMagicLink(email.trim());
      setMessage("Check your inbox for the sign-in link. It opens back here.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page settings">
      <header className="module-head">
        <p className="eyebrow">Settings</p>
        <h1>Progress and sync</h1>
        <p className="module-promise">
          Progress works with no account and no network. Sign in only when you
          want it to follow you between devices.
        </p>
      </header>

      <section className="panel">
        <h2>On this device</h2>
        <dl className="stats stats-inline">
          <div>
            <dt>Stages complete</dt>
            <dd>{stages}</dd>
          </div>
          <div>
            <dt>Modules with notes</dt>
            <dd>{Object.keys(notes).filter((k) => notes[k]?.trim()).length}</dd>
          </div>
          <div>
            <dt>Arena attempts</dt>
            <dd>{attempts.length}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>Account</h2>

        {!authAvailable && (
          <>
            <p className="muted">
              Running in <b>local-only</b> mode — no Supabase credentials in this
              build. Everything still works; progress lives in this browser.
            </p>
            <p className="muted">
              To enable sync: create a Supabase project, run{" "}
              <code>supabase/migrations/0001_init.sql</code>, then set{" "}
              <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.
            </p>
          </>
        )}

        {authAvailable && !session && (
          <form className="auth-form" onSubmit={onSubmit}>
            <p className="muted">
              Email magic link. No password, no third-party identity provider.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Send sign-in link"}
            </button>
            {message && <p className="auth-ok">{message}</p>}
            {error && <p className="auth-error">{error}</p>}
          </form>
        )}

        {authAvailable && session && (
          <div className="auth-signed">
            <p>
              Signed in as <b>{session.user.email}</b>. Progress from this device
              has been merged upward; changes sync on a short delay.
            </p>
            <button className="btn btn-ghost" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
