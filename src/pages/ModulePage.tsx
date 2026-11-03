import { useState } from "react";
import { STAGE_LABELS } from "../content";
import type { Module } from "../content/types";
import { PARTS } from "../content/types";
import { Notes } from "../components/Notes";
import { ResourceList } from "../components/ResourceList";
import { StageContent } from "../components/StageContent";
import { completeStage, useStore } from "../lib/store";

export function ModulePage({ module }: { module: Module }) {
  const { progress } = useStore();
  const done = progress[module.slug] ?? [];
  const firstIncomplete = module.stages.findIndex((s) => !done.includes(s.id));
  const [index, setIndex] = useState(firstIncomplete === -1 ? 0 : firstIncomplete);

  const part = PARTS.find((p) => p.id === module.part);
  const stage = module.stages[index];
  const allDone =
    module.stages.length > 0 && done.length >= module.stages.length;

  if (!module.ready || !stage) {
    return (
      <div className="page module-page">
        <p className="eyebrow">
          {part?.label} · Module {module.number}
        </p>
        <h1>{module.title}</h1>
        <p className="module-promise">{module.promise}</p>
        <div className="locked-panel">
          <p>
            This module is written and lands in the next content batch. The
            structure, widgets and progress tracking are already wired, so
            finishing it is authoring, not engineering.
          </p>
          <a className="btn btn-primary" href="#/">
            Back to the curriculum
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page module-page">
      <header className="module-head">
        <p className="eyebrow">
          Part {part?.label.replace("Part ", "")} · Module{" "}
          {String(module.number).padStart(2, "0")} · {module.minutes} min
        </p>
        <h1>{module.title}</h1>
        <p className="module-promise">{module.promise}</p>
      </header>

      <nav className="stepper" aria-label="Module stages">
        {module.stages.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <button
              key={s.id}
              className={[
                "step",
                i === index ? "step-active" : "",
                isDone ? "step-done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setIndex(i)}
            >
              <span className="step-dot">{isDone ? "✓" : i + 1}</span>
              <span className="step-label">{STAGE_LABELS[s.id]}</span>
            </button>
          );
        })}
      </nav>

      <StageContent stage={stage} slug={module.slug} index={index} />

      <div className="stage-nav">
        <button
          className="btn btn-ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          ← Previous
        </button>

        {index < module.stages.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              completeStage(module.slug, stage.id);
              setIndex((i) => Math.min(module.stages.length - 1, i + 1));
            }}
          >
            Complete &amp; continue →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => completeStage(module.slug, stage.id)}
            disabled={done.includes(stage.id)}
          >
            {done.includes(stage.id) ? "Module complete ✓" : "Finish this module"}
          </button>
        )}
      </div>

      {allDone && (
        <div className="module-complete">
          <p>
            <b>Module {module.number} complete.</b> You've got the arithmetic.
            The next module makes it break.
          </p>
        </div>
      )}

      <ResourceList resources={module.resources} />

      <Notes
        slug={module.slug}
        title={stage.id === "say" ? "Your 150-word answer" : "Your notes"}
        wordTarget={stage.id === "say" ? 150 : undefined}
        placeholder={
          stage.id === "say"
            ? "Start with the three numbers. Then the tail. Then the tradeoff and the reversal condition."
            : undefined
        }
      />
    </div>
  );
}
