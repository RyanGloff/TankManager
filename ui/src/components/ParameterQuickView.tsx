import { useEffect, useState } from "react";
import ArcProgressBar from "./ArcProgressBar";
import "./ParameterQuickView.css";
import {
  ParameterReading,
  fetchLatestParameterReading,
} from "../models/ParameterReading";
import { fetchParameterGoal } from "../models/ParameterGoal";

type ParameterQuickViewProps = {
  label: string;
  tankId: number | null;
  parameterId: number | null;
};

function ParameterQuickView(props: ParameterQuickViewProps) {
  const [reading, setReading] = useState<ParameterReading | null>(null);
  const [lowLimit, setLowLimit] = useState<number | null>(null);
  const [highLimit, setHighLimit] = useState<number | null>(null);

  useEffect(() => {
    async function update() {
      if (!props.tankId) return;
      if (!props.parameterId) return;
      const res = await fetchLatestParameterReading({
        tankId: props.tankId,
        parameterId: props.parameterId,
      });
      if (!res) {
        setReading(null);
        return;
      }
      setReading(res);
    }

    update();
  }, [props.tankId, props.parameterId]);

  useEffect(() => {
    async function update() {
      if (!props.tankId || !props.parameterId) {
        setLowLimit(null);
        setHighLimit(null);
        return;
      }
      const goalRes = await fetchParameterGoal({
        tankId: props.tankId,
        parameterId: props.parameterId,
      });
      if (!goalRes) return;
      setLowLimit(goalRes.lowLimit);
      setHighLimit(goalRes.highLimit);
    }

    update();
  }, [props.tankId, props.parameterId]);

  return (
    <>
      <div className="parameter-quick-view" data-parameter={props.label}>
        <h1>{props.label}</h1>
        <ArcProgressBar
          value={reading?.value ?? null}
          lowLimit={lowLimit}
          highLimit={highLimit}
          fillColor="var(--turquois-clr-300)"
        />
      </div>
    </>
  );
}

export default ParameterQuickView;
