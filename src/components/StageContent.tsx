import { useMemo, useState } from "react";
import type { Stage } from "../content/types";
import { renderMarkdown } from "../lib/markdown";
import { completeStage, completedStages, uncompleteStage } from "../lib/store";
import { Widget } from "../widgets/registry";

function Check({
  check,
  slug,
  stageId,
}: {
  check: NonNullable<Stage["check"]>;
  slug: string;
  stageId: Stage["id"];
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === check.answer;

  return (
    <div className="check">
      <p className="check-question">{check.question}</p>
      <div className="check-options">
        {check.options.map((option, i) => (
          <button
            key={option}
            className={[
              "check-option",
              answered && i === check.answer ? "check-correct" : "",
              answered && i === picked && !correct ? "check-wrong" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setPicked(i)}
            disabled={answered && correct}
          >
            {option}
          </button>
        ))}
      </div>
      {answered && (
        <p className={`check-explain ${correct ? "" : "check-explain-wrong"}`}>
          {correct ? "Right. " : "Not quite. "}
          {check.explain}
        </p>
      )}
      {correct && (
        <button
          className="btn btn-ghost"
          onClick={() => completeStage(slug, stageId)}
        >
          Already knew it? Mark Derive complete →
        </button>
      )}
    </div>
  );
}

export function StageContent({
  stage,
  slug,
  index,
}: {
  stage: Stage;
  slug: string;
  index: number;
}) {
  const done = completedStages(slug).includes(stage.id);
  const html = useMemo(() => renderMarkdown(stage.body), [stage.body]);

  return (
    <section className="stage">
      <header className="stage-header">
        <span className="stage-index">{String(index + 1).padStart(2, "0")}</span>
        <h2>{stage.title}</h2>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      {stage.widget && <Widget id={stage.widget} />}
      {stage.check && (
        <Check check={stage.check} slug={slug} stageId={stage.id} />
      )}

      <div className="stage-actions">
        <button
          className={`btn ${done ? "btn-ghost" : "btn-primary"}`}
          onClick={() =>
            done ? uncompleteStage(slug, stage.id) : completeStage(slug, stage.id)
          }
        >
          {done ? "Completed ✓  (undo)" : "Mark this stage complete"}
        </button>
      </div>
    </section>
  );
}
