import { getStatus } from "../src/lib/apex/getStatus";

async function testGetStatus() {
  const result = await getStatus("192.168.51.10", "admin", "1234");
  console.log(result);
}

testGetStatus();
