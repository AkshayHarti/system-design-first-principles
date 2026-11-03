import type { ReactElement } from "react";
import { CapacityModel } from "./CapacityModel";
import { FanoutTail } from "./FanoutTail";

const REGISTRY: Record<string, () => ReactElement> = {
  "fanout-tail": FanoutTail,
  "capacity-model": CapacityModel,
};

export function Widget({ id }: { id: string }) {
  const Component = REGISTRY[id];
  if (!Component) {
    return <div className="callout callout-warn">Unknown widget: {id}</div>;
  }
  return <Component />;
}
