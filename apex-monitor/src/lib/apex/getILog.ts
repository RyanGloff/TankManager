import fetch from "node-fetch";
import { getConnectSid } from "./getConnectSid";
import { timestampSchema, yymmddSchema } from "./apexUtil";
import { z } from "zod";

const ILogExtraSdStatSchema = z.object({
  reads: z.coerce.number(),
  writes: z.coerce.number(),
  readErr: z.coerce.number(),
  writeErr: z.coerce.number(),
});

const ILogResponseSchema = z.object({
  ilog: z.object({
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
      sdstat: ILogExtraSdStatSchema,
    }),
    timezone: z.string(),
    record: z.array(
      z.object({
        date: timestampSchema,
        data: z.array(
          z.object({
            name: z.string(),
            did: z.string(),
            type: z.string(),
            value: z.coerce.number(),
          }),
        ),
      }),
    ),
  }),
});

export type ILogExtraSdStat = {
  reads: number;
  writes: number;
  readErr: number;
  writeErr: number;
};

export type ILogExtra = {
  sdver: string;
  sddate: Date;
  sdserial: number;
  sdextDate: Date;
  sdhealth: number;
  WWWVer: string;
  TmpUart: string;
  sdstat: ILogExtraSdStat;
};

export type ILogRecordData = {
  name: string;
  did: string;
  type: string;
  value: number;
};

export type ILogRecord = {
  date: Date;
  data: ILogRecordData[];
};

export type ILog = {
  hostname: string;
  software: string;
  hardware: string;
  serial: string;
  type: string;
  extra: ILogExtra;
  timezone: string;
  record: ILogRecord[];
};

export type ILogResponse = {
  ilog: ILog;
};

export async function getILog(
  host: string,
  username: string,
  password: string,
  startDay: string,
  numDays?: number,
): Promise<ILogResponse> {
  const { connectSid } = await getConnectSid(host, username, password);
  const url = `http://${host}/rest/ilog?days=${numDays || 7}&sdate=${startDay}&_=${Date.now()}`;
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
  const body = ILogResponseSchema.parse(raw) as ILogResponse;
  return body;
}
