import { useMemo, useState } from "react";

const Z99 = 2.326348; // standard normal quantile for p99
const Z95 = 1.644854;
const TRIALS = 4000;

/** Box–Muller: one standard normal sample. */
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

interface Result {
  p50: number;
  p90: number;
  p99: number;
  tailShare: number;
  extraWork: number;
}

function simulate(
  shards: number,
  p50: number,
  p99: number,
  hedge: boolean,
): Result {
  const mu = Math.log(p50);
  const sigma = Math.max(0.01, (Math.log(p99) - mu) / Z99);
  const hedgeAt = Math.exp(mu + Z95 * sigma);

  const samples: number[] = [];
  let shardCalls = 0;
  let tailRequests = 0;

  for (let t = 0; t < TRIALS; t++) {
    let worst = 0;
    let hitTail = false;
    for (let s = 0; s < shards; s++) {
      const a = Math.exp(mu + sigma * gaussian());
      shardCalls++;
      let value = a;
      if (hedge && a > hedgeAt) {
        const b = Math.exp(mu + sigma * gaussian());
        shardCalls++;
        value = Math.min(a, b);
      }
      if (a > p99) hitTail = true;
      if (value > worst) worst = value;
    }
    if (hitTail) tailRequests++;
    samples.push(worst);
  }

  samples.sort((a, b) => a - b);
  const baseline = TRIALS * shards;
  return {
    p50: percentile(samples, 50),
    p90: percentile(samples, 90),
    p99: percentile(samples, 99),
    tailShare: tailRequests / TRIALS,
    extraWork: (shardCalls - baseline) / baseline,
  };
}

export function FanoutTail() {
  const [shards, setShards] = useState(50);
  const [p50, setP50] = useState(40);
  const [p99, setP99] = useState(400);
  const [hedge, setHedge] = useState(false);

  const result = useMemo(
    () => simulate(shards, p50, Math.max(p99, p50 * 1.2), hedge),
    [shards, p50, p99, hedge],
  );

  // Re-simulate only when inputs change, and avoid a stale-result flash by
  // deriving everything from the memo above.
  const scale = Math.max(result.p99, 1);
  const rows: Array<[string, number]> = [
    ["p50", result.p50],
    ["p90", result.p90],
    ["p99", result.p99],
  ];

  return (
    <div className="widget">
      <div className="widget-controls">
        <label className="field">
          <span>
            Shards in the fan-out <b>{shards}</b>
          </span>
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={shards}
            onChange={(e) => setShards(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Per-shard p50 <b>{p50} ms</b>
          </span>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={p50}
            onChange={(e) => setP50(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Per-shard p99 <b>{p99} ms</b>
          </span>
          <input
            type="range"
            min={60}
            max={2000}
            step={20}
            value={p99}
            onChange={(e) => setP99(Number(e.target.value))}
          />
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={hedge}
            onChange={(e) => setHedge(e.target.checked)}
          />
          <span>Hedge requests after p95</span>
        </label>
      </div>

      <div className="widget-output">
        <div className="headline">
          <span className="headline-value">{Math.round(result.p99)} ms</span>
          <span className="headline-label">end-to-end p99</span>
        </div>

        <div className="bars">
          {rows.map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span className="bar-label">{label}</span>
              <div className="bar-track">
                <div
                  className={`bar-fill bar-${label}`}
                  style={{ width: `${Math.max(2, (value / scale) * 100)}%` }}
                />
              </div>
              <span className="bar-value">{Math.round(value)} ms</span>
            </div>
          ))}
        </div>

        <dl className="stats">
          <div>
            <dt>Requests that wait on a tail</dt>
            <dd>{(result.tailShare * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Extra shard work from hedging</dt>
            <dd>{(result.extraWork * 100).toFixed(0)}%</dd>
          </div>
        </dl>

        <p className={`callout ${result.tailShare > 0.5 ? "callout-warn" : ""}`}>
          {result.tailShare > 0.5
            ? `More than half of all requests now wait on at least one slow shard. Your average latency is still fine. This is what "the tail" actually means.`
            : result.tailShare > 0.15
              ? "A meaningful slice of traffic is now bounded by the slowest shard, not the typical one. Fan-out has made p99 a product property."
              : "At this width, requests mostly finish at the speed of a single shard. Widen the fan-out and watch that stop being true."}
        </p>
      </div>
    </div>
  );
}
