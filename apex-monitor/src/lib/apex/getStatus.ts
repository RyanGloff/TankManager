import fetch from "node-fetch";
import { getConnectSid } from "./getConnectSid";
import { timestampSchema, yymmddSchema } from "./apexUtil";
import { z } from "zod";

const StatusResponseSchema = z.object({
  system: z.object({
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
    date: timestampSchema,
  }),
  modules: z.array(
    z.object({
      abaddr: z.coerce.number(),
      hwtype: z.string(),
      hwrev: z.coerce.number(),
      swrev: z.coerce.number(),
      swstat: z.string(),
      pcount: z.coerce.number(),
      perror: z.coerce.number(),
      reatt: z.coerce.number(),
      inact: z.coerce.number(),
      boot: z.coerce.boolean(),
      present: z.coerce.boolean(),
      extra: z.object({
        temp: z.coerce.number().optional(),
        errorCode: z.coerce.number().optional(),
        errorMask: z.coerce.number().optional(),
        status: z.string().optional(),
        lastCal: timestampSchema.optional(),
        resetTime: z.array(z.number()).optional(),
        levels: z.array(z.number()).optional(),
      }),
    }),
  ),
  nstat: z.object({
    dhcp: z.coerce.boolean(),
    hostname: z.string(),
    ipaddr: z.string(),
    netmask: z.string(),
    gateway: z.string(),
    dns: z.array(z.string()),
    httpPort: z.coerce.number(),
    quality: z.coerce.number(),
    strength: z.coerce.number(),
    link: z.coerce.boolean(),
    wifiAPLock: z.coerce.boolean(),
    wifiEnable: z.coerce.boolean(),
    wifiAPPassword: z.string(),
    ssid: z.string(),
    wifiAP: z.coerce.boolean(),
    emailPassword: z.string(),
    updateFirmware: z.coerce.boolean(),
    latestFirmware: z.string(),
  }),
  feed: z.object({
    name: z.coerce.number(),
    active: z.coerce.number(),
  }),
  power: z.object({
    failed: timestampSchema,
    restored: timestampSchema,
  }),
  outputs: z.array(
    z.object({
      status: z.array(z.string()),
      name: z.string(),
      gid: z.string(),
      type: z.string(),
      ID: z.coerce.number(),
      did: z.string(),
    }),
  ),
  inputs: z.array(
    z.object({
      did: z.string(),
      type: z.string(),
      name: z.string(),
      value: z.coerce.number(),
    }),
  ),
  link: z.object({
    linkState: z.coerce.number(),
    linkKey: z.string(),
    link: z.coerce.boolean(),
  }),
});

export type StatusResponseSystemExtraSdstat = {
  reads: number;
  writes: number;
  readErr: number;
  writeErr: number;
};

export type StatusResponseSystemExtra = {
  sdver: string;
  sddate: Date;
  sdserial: number;
  sdextDate: Date;
  sdhealth: number;
  WWWVer: string;
  TmpUart: string;
  sdstat: StatusResponseSystemExtraSdstat;
};

export type StatusResponseSystem = {
  hostname: string;
  software: string;
  hardware: string;
  serial: string;
  type: string;
  extra: StatusResponseSystemExtra;
  timezone: string;
  date: Date;
};

export type StatusResponseModuleExtra = {
  temp?: number;
  errorCode?: number;
  errorMask?: number;
  status?: string;
  lastCal?: Date;
  resetTime?: number[];
  levels?: number[];
};

export type StatusResponseModule = {
  abaddr: number;
  hwtype: string;
  hwrev: number;
  swrev: number;
  swstat: string;
  pcount: number;
  perror: number;
  reatt: number;
  inact: number;
  boot: boolean;
  present: boolean;
  extra: StatusResponseModuleExtra;
};

export type StatusResponseNStat = {
  dhcp: boolean;
  hostname: string;
  ipaddr: string;
  netmask: string;
  gateway: string;
  dns: string[];
  httpPort: number;
  quality: number;
  strength: number;
  link: boolean;
  wifiAPLock: boolean;
  wifiEnable: boolean;
  wifiAPPassword: string;
  ssid: string;
  wifiAP: boolean;
  emailPassword: string;
  updateFirmware: boolean;
  latestFirmware: string;
};

export type StatusResponseFeed = {
  name: number;
  active: number;
};

export type StatusResponsePower = {
  failed: Date;
  restored: Date;
};

export type StatusResponseOutput = {
  status: string[];
  name: string;
  gid: string;
  type: string;
  ID: number;
  did: string;
};

export type StatusResponseInput = {
  did: string;
  type: string;
  name: string;
  value: number;
};

export type StatusResponseLink = {
  linkState: number;
  linkKey: string;
  link: boolean;
};

export type StatusResponse = {
  system: StatusResponseSystem;
  modules: StatusResponseModule[];
  nstat: StatusResponseNStat;
  feed: StatusResponseFeed;
  power: StatusResponsePower;
  outputs: StatusResponseOutput[];
  inputs: StatusResponseInput[];
  link: StatusResponseLink;
};

export async function getStatus(
  host: string,
  username: string,
  password: string,
): Promise<StatusResponse> {
  const { connectSid } = await getConnectSid(host, username, password);
  const url = `http://${host}/rest/status?_=${Date.now()}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "accept-version": "1",
      "x-requested-with": "XMLHttpRequest",
      cookie: `connect.sid=${connectSid}`,
      Referer: `http://${host}/apex/status`,
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });
  const raw = await response.json();
  const body = StatusResponseSchema.parse(raw) as StatusResponse;
  return body;
}
