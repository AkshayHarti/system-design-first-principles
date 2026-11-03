import { useMemo, useState } from "react";

const DAU_MIN = Math.log10(10_000);
const DAU_MAX = Math.log10(50_000_000);

function fmt(n: number, digits = 1): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(digits)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(digits)}k`;
  return n.toFixed(n < 10 ? digits : 0);
}

function money(n: number): string {
  return n >= 10_000
    ? `$${fmt(n, 1)}`
    : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function CapacityModel() {
  const [dauSlider, setDauSlider] = useState(50);
  const [reqPerUser, setReqPerUser] = useState(12);
  const [peakFactor, setPeakFactor] = useState(3);
  const [writeShare, setWriteShare] = useState(10);
  const [payloadKb, setPayloadKb] = useState(4);
  const [retentionDays, setRetentionDays] = useState(365);
  const [replication, setReplication] = useState(3);
  const [nodeRps, setNodeRps] = useState(250);
  const [nodeCost, setNodeCost] = useState(70);

  const dau = Math.round(
    10 ** (DAU_MIN + (dauSlider / 100) * (DAU_MAX - DAU_MIN)),
  );

  const m = useMemo(() => {
    const requestsPerDay = dau * reqPerUser;
    const avgRps = requestsPerDay / 86_400;
    const peakRps = avgRps * peakFactor;
    const nodes = Math.ceil(peakRps / nodeRps) + 2; // N+2 for failure + deploys
    const monthly = nodes * nodeCost;

    const writesPerDay = requestsPerDay * (writeShare / 100);
    const bytesPerDay = writesPerDay * payloadKb * 1024;
    const gbPerDay = bytesPerDay / 1024 ** 3;
    const yearsRetained = Math.min(retentionDays, 365 * 5) / 365;
    const tbStored = (bytesPerDay * 365 * yearsRetained * replication) / 1024 ** 4;
    const costPerMillion = monthly / ((requestsPerDay * 30) / 1_000_000);

    return {
      avgRps,
      peakRps,
      nodes,
      monthly,
      gbPerDay,
      tbStored,
      costPerMillion,
      writesPerDay,
    };
  }, [
    dau,
    reqPerUser,
    peakFactor,
    writeShare,
    payloadKb,
    retentionDays,
    replication,
    nodeRps,
    nodeCost,
  ]);

  return (
    <div className="widget">
      <div className="widget-controls">
        <label className="field">
          <span>
            Daily active users <b>{fmt(dau, 1)}</b>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={dauSlider}
            onChange={(e) => setDauSlider(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Requests / user / day <b>{reqPerUser}</b>
          </span>
          <input
            type="range"
            min={1}
            max={50}
            value={reqPerUser}
            onChange={(e) => setReqPerUser(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Peak factor <b>{peakFactor}×</b>
          </span>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={peakFactor}
            onChange={(e) => setPeakFactor(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Writes as share of requests <b>{writeShare}%</b>
          </span>
          <input
            type="range"
            min={1}
            max={50}
            value={writeShare}
            onChange={(e) => setWriteShare(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Payload per write <b>{payloadKb} KB</b>
          </span>
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={payloadKb}
            onChange={(e) => setPayloadKb(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Retention <b>{retentionDays} days</b>
          </span>
          <input
            type="range"
            min={30}
            max={3650}
            step={30}
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Replication factor <b>{replication}×</b>
          </span>
          <input
            type="range"
            min={1}
            max={3}
            value={replication}
            onChange={(e) => setReplication(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            One node handles <b>{nodeRps} rps</b>
          </span>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={nodeRps}
            onChange={(e) => setNodeRps(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>
            Cost per node <b>{money(nodeCost)}/mo</b>
          </span>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={nodeCost}
            onChange={(e) => setNodeCost(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="widget-output">
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">Average rps</span>
            <span className="stat-value">{fmt(m.avgRps)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Peak rps</span>
            <span className="stat-value">{fmt(m.peakRps)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Nodes (N+2)</span>
            <span className="stat-value">{m.nodes}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Compute cost</span>
            <span className="stat-value">{money(m.monthly)}/mo</span>
          </div>
          <div className="stat">
            <span className="stat-label">Cost per million requests</span>
            <span className="stat-value">${m.costPerMillion.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Writes per day</span>
            <span className="stat-value">{fmt(m.writesPerDay)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">New data per day</span>
            <span className="stat-value">
              {m.gbPerDay < 1
                ? `${(m.gbPerDay * 1024).toFixed(0)} MB`
                : `${m.gbPerDay.toFixed(1)} GB`}
            </span>
          </div>
          <div className={`stat ${m.tbStored > 100 ? "stat-warn" : ""}`}>
            <span className="stat-label">Retained, replicated</span>
            <span className="stat-value">
              {m.tbStored < 1
                ? `${(m.tbStored * 1024).toFixed(0)} GB`
                : `${m.tbStored.toFixed(1)} TB`}
            </span>
          </div>
        </div>

        <p className={`callout ${m.tbStored > 100 ? "callout-warn" : ""}`}>
          {m.tbStored > 100
            ? `Storage is now the binding constraint: ${m.tbStored.toFixed(
                0,
              )} TB retained. No amount of load balancing fixes this. The levers are retention, payload size, and who actually needs the data hot.`
            : m.costPerMillion > 5
              ? "Compute is the binding constraint at this unit cost. Look at work per request before you look at bigger machines."
              : "Neither compute nor storage is fatal at these inputs. Move one input 100× and find out which one becomes the conversation."}
        </p>
      </div>
    </div>
  );
}
