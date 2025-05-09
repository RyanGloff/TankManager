import { sendApexReadingsToApiForTank, StoreRes } from "./apexReadingsToApi";
import { getParameters, Parameter } from "./lib/Parameter";
import { getTanks, Tank } from "./lib/Tank";
import { toMapById, toMapByName } from "./utils";

const batchSizeDays = 10;

async function apexReadingsToApiHistoricalForTank(
  tank: Tank,
  parameters: Map<string, Parameter>,
): Promise<{ res: StoreRes; tankId: number } | null> {
  const workingRes = { stored: 0, total: 0 };
  let readingsFound = true;
  let currentStartDay = 10;
  while (readingsFound) {
    console.log(
      `Getting historical data for tank [${tank.id}] ${tank.name}. Day range: ${currentStartDay} - ${currentStartDay - batchSizeDays}`,
    );
    const storageResult = await sendApexReadingsToApiForTank(
      tank,
      parameters,
      batchSizeDays,
      currentStartDay,
      false,
    );
    if (!storageResult) return null;
    workingRes.stored += storageResult.res.stored;
    workingRes.total += storageResult.res.total;
    console.log(
      `Current reading stats: stored: ${workingRes.stored} total: ${workingRes.total}`,
    );
    if (storageResult.res.stored === 0) {
      readingsFound = false;
      console.log(`No more readings found for tank [${tank.id}] ${tank.name}`);
    } else {
      currentStartDay += batchSizeDays;
    }
  }
  return { res: workingRes, tankId: tank.id as number };
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
      Array.from(tanks.values()).map((tank: Tank) =>
        apexReadingsToApiHistoricalForTank(tank, parameters),
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
