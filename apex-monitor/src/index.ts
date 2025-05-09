import { apexReadingsToApi } from "./apexReadingsToApi";
import { apexReadingsToApiHistorical } from "./apexReadingsToApiHistorical";

const INTERVAL = 1000 * 60;

async function main() {
  console.log(
    `Starting polling apex readings every ${INTERVAL / 1000} seconds`,
  );
  try {
    await apexReadingsToApiHistorical();
  } catch (err) {
    console.log(err);
  }
  setInterval(() => {
    try {
      apexReadingsToApi();
    } catch (err) {
      console.log(err);
    }
  }, INTERVAL);
}

main();
