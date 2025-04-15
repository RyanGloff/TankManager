import "./ArcProgressBar.css";

type ArcProgressBarProps = {
  lowLimit: number | null;
  highLimit: number | null;
  value: number | null;
  fillColor?: string;
};

function createSvgDString(r: number, gapDeg: number): string {
  const d = r * 2;
  const gapRad = (Math.PI / 180) * gapDeg;
  const openingX = d * Math.sin(gapRad / 2);
  const deltaY = r * Math.cos(gapRad / 2);
  const start = { x: 50 - openingX / 2, y: 50 + deltaY };
  const end = { x: 50 + openingX / 2, y: 50 + deltaY };
  return `M${start.x},${start.y} A${r},${r}, 0, 1, 1 ${end.x},${end.y}`;
}

type DashValues = {
  array: string;
  offset: number;
};

function limit(low: number, value: number, high: number): number {
  return Math.min(Math.max(low, value), high);
}

function createDashValues(
  r: number,
  gapDeg: number,
  percentage: number,
): DashValues {
  const d = r * 2;
  const c = Math.PI * d;
  const arcLen = c * ((360 - gapDeg) / 360);
  const arcUsage = (percentage / 100) * arcLen;
  // This has to be < arcLen due to arcLen wrapping to 0
  const boundedArcUsage = limit(0, arcUsage, arcLen - 1);
  return {
    array: `0 ${arcLen}`,
    offset: arcLen - boundedArcUsage,
  };
}

function pickValueColor(props: ArcProgressBarProps): string {
  if (
    props.lowLimit === null ||
    props.highLimit === null ||
    props.value === null
  ) {
    return `var(--base-clr-200)`;
  }
  if (props.lowLimit > props.value || props.value > props.highLimit) {
    return `var(--cherry-clr-300)`;
  }
  return `var(--base-clr-200)`;
}

function pickButtonColor(props: ArcProgressBarProps): string {
  if (
    props.lowLimit === null ||
    props.highLimit === null ||
    props.value === null
  ) {
    return `var(--base-clr-200)`;
  }
  if (props.lowLimit > props.value || props.value > props.highLimit) {
    return `var(--cherry-clr-300)`;
  }
  return props.fillColor || `var(--base-clr-400)`;
}

function ArcProgressBar(props: ArcProgressBarProps) {
  const r = 45;
  const gapDeg = 45;

  const range =
    props.highLimit && props.lowLimit ? props.highLimit - props.lowLimit : null;
  const percentage =
    props.value && props.lowLimit && range
      ? ((props.value - props.lowLimit) / range) * 100
      : null;

  const dString = createSvgDString(r, gapDeg);
  const dashValues = createDashValues(r, gapDeg, percentage || 0);

  const valueColor = pickValueColor(props);
  const buttonColor = pickButtonColor(props);

  function numExists(v: any) {
    return v === 0 || v;
  }

  return (
    <>
      <svg
        className="arc"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        <path className="arc-bar" d={dString} />
        {numExists(props.value) &&
        numExists(props.lowLimit) &&
        numExists(props.highLimit) ? (
          <path
            className="arc-fill"
            d={dString}
            style={{
              strokeDasharray: dashValues.array,
              strokeDashoffset: dashValues.offset,
              stroke: buttonColor,
            }}
          />
        ) : (
          ""
        )}
        {numExists(props.value) ? (
          <text
            x="50"
            y="62"
            fill={valueColor}
            fontSize="35"
            textAnchor="middle"
          >
            {props.value}
          </text>
        ) : (
          ""
        )}
        {numExists(props.lowLimit) && numExists(props.highLimit) ? (
          <text className="limit" x="50" y="75">
            {props.lowLimit} - {props.highLimit}
          </text>
        ) : (
          ""
        )}
      </svg>
    </>
  );
}

export default ArcProgressBar;
