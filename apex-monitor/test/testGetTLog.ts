import { getTLog } from "../src/lib/apex/getTLog";

async function testGetTLog() {
  const result = await getTLog("192.168.51.10", "admin", "1234", "250401", 20);
  console.log(result);
}

testGetTLog();
