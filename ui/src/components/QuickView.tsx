import { useEffect, useState } from "react";
import ParameterQuickView from "./ParameterQuickView";
import { Parameter, fetchParameters } from "../models/Parameter";
import { Tank } from "../models/Tank";

import TankSelector from "./TankSelector";

import "./QuickView.css";

function toLabel(name: string): string {
  if (!name) return "";
  return name[0].toUpperCase() + name.slice(1);
}

const parameterOrder = [
  "temperature",
  "ph",
  "nitrate",
  "phosphate",
  "alkalinity",
  "calcium",
  "magnesium",
];

function orderParameters(parameters: Parameter[]): Parameter[] {
  const map = parameters.reduce(
    (agg: Map<string, Parameter>, curr: Parameter) => {
      agg.set(curr.name, curr);
      return agg;
    },
    new Map<string, Parameter>(),
  );
  const orderedParameters: Parameter[] = parameterOrder
    .map((name: string) => {
      return map.get(name);
    })
    .filter((p: Parameter | undefined) => p !== undefined);
  return orderedParameters;
}

function QuickView() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  useEffect(() => {
    fetchParameters().then(orderParameters).then(setParameters);
  }, []);

  function onTankChange(tank: Tank) {
    setSelectedTank(tank);
  }

  return (
    <>
      <div className="quick-view">
        <TankSelector onChange={onTankChange}></TankSelector>
        {parameters.map((p) => (
          <ParameterQuickView
            key={p.id}
            tankId={selectedTank?.id || null}
            parameterId={p.id}
            label={toLabel(p.name)}
          />
        ))}
      </div>
    </>
  );
}

export default QuickView;
