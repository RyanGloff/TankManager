import {
  apexReadingsToApi,
  apexReadingsToApiHistorical,
} from "./apexReadingsToApi";

const INTERVAL = 1000 * 60;

async function main() {
  console.log(
    `Starting polling apex readings every ${INTERVAL / 1000} seconds`,
  );
  await apexReadingsToApiHistorical();
  setInterval(() => {
    try {
      apexReadingsToApi();
    } catch (err) {
      console.log(err);
    }
  }, INTERVAL);
}

main();
