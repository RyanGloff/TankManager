import { getILog } from "../src/lib/apex/getILog";

async function testGetILog() {
  const result = await getILog("192.168.51.10", "admin", "1234", "250401", 20);
  console.log(result);
}

testGetILog();
