import {
  ApexParameterReading,
  getAllApexParameterReadings,
} from "./lib/apex/getAllApexParameterReadings";
import { getTanks, Tank } from "./lib/Tank";
import { getParameters, Parameter } from "./lib/Parameter";
import { getStartDay } from "./lib/apex/apexUtil";
import {
  storeParameterReadingBulk,
  ParameterReading,
} from "./lib/ParameterReading";
import { toMapById, toMapByName } from "./utils";

export type StoreRes = {
  stored: number;
  total: number;
};

function apexReadingsToParameterReadings(
  apexData: ApexParameterReading[],
  tank: Tank,
  parameters: Map<string, Parameter>,
): ParameterReading[] {
  return apexData
    .map((reading): ParameterReading | undefined => {
      const parameterId = parameters.get(reading.parameter)?.id;
      if (!parameterId) return;
      return {
        tankId: tank.id as number,
        parameterId: parameterId,
        value: reading.value,
        time: reading.time,
        showInDashboard: true,
      };
    })
    .filter((v) => v !== undefined);
}

async function storeParametersReturnMetrics(
  parameterReadings: ParameterReading[],
): Promise<StoreRes> {
  return (
    await storeParameterReadingBulk({ values: parameterReadings })
  ).reduce(
    (agg: StoreRes, curr: ParameterReading | null | undefined): StoreRes => {
      if (curr === undefined) return agg;
      agg.total++;
      if (curr !== null) {
        agg.stored++;
      }
      return agg;
    },
    { stored: 0, total: 0 },
  );
}

export async function sendApexReadingsToApiForTank(
  tank: Tank,
  parameters: Map<string, Parameter>,
  numDays?: number,
  startNumDaysAgo?: number,
  includeCurrentStatus?: boolean,
): Promise<{ res: StoreRes; tankId: number } | null> {
  if (!tank.apexHost) return null;
  const apexData = await getAllApexParameterReadings(
    tank.apexHost,
    "admin",
    "1234",
    getStartDay(startNumDaysAgo || numDays || 2),
    numDays || 2,
    includeCurrentStatus,
  );
  console.log(
    `Found ${apexData.length} apex readings on tank [${tank.id}] ${tank.name}`,
  );

  const newParameterReadings = apexReadingsToParameterReadings(
    apexData,
    tank,
    parameters,
  );
  const results = await storeParametersReturnMetrics(newParameterReadings);

  console.log(
    `Stored ${results.stored} of ${results.total} for tank [${tank.id}] ${tank.name}`,
  );
  return { res: results, tankId: tank.id as number };
}

export async function apexReadingsToApi(
  numDays?: number,
  startNumDaysAgo?: number,
  includeCurrentStatus?: boolean,
): Promise<Map<number, StoreRes>> {
  const getTanksPromise = getTanks();
  const getParametersPromise = getParameters();
  const results = await Promise.all([getTanksPromise, getParametersPromise]);
  const tanks = toMapById<Tank>(results[0]);
  const parameters = toMapByName<Parameter>(results[1]);

  return (
    await Promise.all(
      Array.from(tanks.values()).map(
        async (tank: Tank) =>
          await sendApexReadingsToApiForTank(
            tank,
            parameters,
            numDays,
            startNumDaysAgo,
            includeCurrentStatus === undefined ? false : includeCurrentStatus,
          ),
      ),
    )
  ).reduce(
    (
      agg: Map<number, StoreRes>,
      curr: { res: StoreRes; tankId: number } | null,
    ) => {
      if (curr === null) return agg;
      agg.set(curr.tankId, curr.res);
      return agg;
    },
    new Map<number, StoreRes>(),
  );
}
