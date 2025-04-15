import fetch from "node-fetch";
import { z } from "zod";

let connectSid: string | null = null;

const loginResponseSchema = z.object({
  "connect.sid": z.string(),
});

export type ConnectSid = {
  connectSid: string;
};

export async function getConnectSid(
  host: string,
  username: string,
  password: string,
): Promise<ConnectSid> {
  if (connectSid === null) {
    const response = await fetch(`http://${host}/rest/login`, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "accept-version": "1",
        "content-type": "application/json",
        "x-csrf-token": "undefined",
        "x-requested-with": "XMLHttpRequest",
        Referer: `http://${host}/`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `{\"login\":\"${username}\",\"password\":\"${password}\",\"remember_me\":false}`,
      method: "POST",
    });
    const raw = await response.json();
    const body = loginResponseSchema.parse(raw);
    connectSid = body["connect.sid"];
  }
  return { connectSid };
}
