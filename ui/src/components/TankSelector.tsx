import React from "react";

import { useEffect, useState } from "react";
import { Tank, fetchTanks } from "../models/Tank";
import "./TankSelector.css";

export type TankSelectorProps = {
  onChange: (tank: Tank) => void;
};

function TankSelector(props: TankSelectorProps) {
  const [tanks, setTanks] = useState(new Map<number, Tank>());
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTanks().then((tanks) => {
      setTanks(
        tanks.reduce((agg: Map<number, Tank>, curr: Tank) => {
          agg.set(curr.id, curr);
          return agg;
        }, new Map<number, Tank>()),
      );
    });
  }, []);

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newId = Number(event.target.value);

    const tank = tanks.get(newId);
    if (!tank) {
      throw new Error(`Invalid Id selected: ${newId}`);
    }
    setSelectedId(tank.id);
    props.onChange(tank);
  }

  return (
    <>
      <select
        className="tank-selector"
        onChange={onChange}
        value={`${selectedId}`}
      >
        <option value="null">Select A Tank</option>
        {Array.from(tanks.values()).map((tank: Tank) => (
          <option key={tank.id} value={tank.id}>
            {tank.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default TankSelector;
