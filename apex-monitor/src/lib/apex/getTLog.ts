import fetch from "node-fetch";
import { z } from "zod";
import { timestampSchema, yymmddSchema } from "./apexUtil";
import { getConnectSid } from "./getConnectSid";

const TLogResponseSchema = z.object({
  tlog: z.object({
    hostname: z.string(),
    software: z.string(),
    hardware: z.string(),
    serial: z.string(),
    type: z.string(),
    extra: z.object({
      sdver: z.string(),
      sddate: yymmddSchema,
      sdserial: z.coerce.number(),
      sdextDate: yymmddSchema,
      sdhealth: z.coerce.number(),
      WWWVer: z.string(),
      TmpUart: z.string(),
      sdstat: z.object({
        reads: z.coerce.number(),
        writes: z.coerce.number(),
        readErr: z.coerce.number(),
        writeErr: z.coerce.number(),
      }),
    }),
    timezone: z.string(),
    record: z.array(
      z.object({
        date: timestampSchema,
        did: z.string(),
        value: z.coerce.number(),
        confidence: z.coerce.number(),
      }),
    ),
  }),
});

export type TLogExtraSdStat = {
  reads: number;
  writes: number;
  readErr: number;
  writeErr: number;
};

export type TLogExtra = {
  sdver: string;
  sddate: Date;
  sdserial: number;
  sdextDate: Date;
  sdhealth: number;
  WWWVer: string;
  TmpUart: string;
  sdstat: TLogExtraSdStat;
};

export type TLogRecord = {
  date: Date;
  did: string;
  value: number;
  confidence: number;
};

export type TLog = {
  hostname: string;
  software: string;
  hardware: string;
  serial: string;
  type: string;
  extra: TLogExtra;
  timezone: string;
  record: TLogRecord[];
};

export type TLogResponse = {
  tlog: TLog;
};

export async function getTLog(
  host: string,
  username: string,
  password: string,
  startDay: string,
  numDays: number,
): Promise<TLogResponse> {
  const { connectSid } = await getConnectSid(host, username, password);
  const url = `http://${host}/rest/tlog?days=${numDays || 7}&sdate=${startDay}&_=${Date.now()}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "accept-version": "1",
      "x-requested-with": "XMLHttpRequest",
      cookie: `connect.sid=${connectSid}`,
      Referer: `http://${host}/apex/ilog`,
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });
  const raw = await response.json();
  const body = TLogResponseSchema.parse(raw);
  return body;
}
