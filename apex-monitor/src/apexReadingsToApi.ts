import { getAllApexParameterReadings } from "./lib/apex/getAllApexParameterReadings";
import { getTanks, Tank } from "./lib/Tank";
import { getParameters, Parameter } from "./lib/Parameter";
import { getStartDay } from "./lib/apex/apexUtil";
import {
  storeParameterReadingBulk,
  ParameterReading,
} from "./lib/ParameterReading";

function toMapById<T extends { id?: number }>(data: T[]): Map<number, T> {
  return data.reduce((agg: Map<number, T>, curr: T) => {
    if (!curr.id) return agg;
    agg.set(curr.id, curr);
    return agg;
  }, new Map<number, T>());
}

function toMapByName<T extends { name: string }>(data: T[]): Map<string, T> {
  return data.reduce((agg: Map<string, T>, curr: T) => {
    agg.set(curr.name, curr);
    return agg;
  }, new Map<string, T>());
}

export type StoreRes = {
  stored: number;
  total: number;
};

async function sendApexReadingsToApiForTank(
  tank: Tank,
  parameters: Map<string, Parameter>,
  numDays?: number,
  startNumDaysAgo?: number,
): Promise<{ res: StoreRes; tankId: number } | null> {
  if (!tank.apexHost) return null;
  const apexData = await getAllApexParameterReadings(
    tank.apexHost,
    "admin",
    "1234",
    getStartDay(startNumDaysAgo || numDays || 2),
    numDays || 2,
  );
  console.log(
    `Found ${apexData.length} apex readings on tank [${tank.id}] ${tank.name}`,
  );

  const values = apexData
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
  const results = (await storeParameterReadingBulk({ values: values })).reduce(
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
  console.log(
    `Stored ${results.stored} of ${results.total} for tank [${tank.id}] ${tank.name}`,
  );
  return { res: results, tankId: tank.id as number };
}

export async function apexReadingsToApiHistorical(): Promise<
  Map<number, StoreRes>
> {
  const getTanksPromise = getTanks();
  const getParametersPromise = getParameters();
  const results = await Promise.all([getTanksPromise, getParametersPromise]);
  const tanks = toMapById<Tank>(results[0]);
  const parameters = toMapByName<Parameter>(results[1]);

  return (
    await Promise.all(
      Array.from(tanks.values()).map(async (tank: Tank) => {
        const workingRes = { stored: 0, total: 0 };
        let readingsFound = true;
        let currentStartDay = 10;
        const batchSizeDays = 10;
        while (readingsFound) {
          console.log(
            `Getting historical data for tank [${tank.id}] ${tank.name}. Day range: ${currentStartDay} - ${currentStartDay - batchSizeDays}`,
          );
          const res = await sendApexReadingsToApiForTank(
            tank,
            parameters,
            batchSizeDays,
            currentStartDay,
          );
          if (!res) return null;
          workingRes.stored += res.res.stored;
          workingRes.total += res.res.total;
          console.log(
            `Current reading stats: stored: ${workingRes.stored} total: ${workingRes.total}`,
          );
          if (!res.res.stored) {
            readingsFound = false;
            console.log(
              `No more readings found for tank [${tank.id}] ${tank.name}`,
            );
          } else {
            currentStartDay += batchSizeDays;
          }
        }
        return { res: workingRes, tankId: tank.id as number };
      }),
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

export async function apexReadingsToApi(
  numDays?: number,
  startNumDaysAgo?: number,
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
