import { getILog, ILogResponse } from "./getILog";
import { getTLog, TLogResponse } from "./getTLog";
import { getStatus, StatusResponse } from "./getStatus";

export type ApexParameterReading = {
  time: Date;
  parameter: string;
  value: number;
};

const apexParameterNameMap = new Map<string, string>();
apexParameterNameMap.set("Temp", "temperature");
apexParameterNameMap.set("pH", "ph");
apexParameterNameMap.set("2_0", "alkalinity");
apexParameterNameMap.set("alk", "alkalinity");
apexParameterNameMap.set("2_1", "calcium");
apexParameterNameMap.set("ca", "calcium");
apexParameterNameMap.set("2_2", "magnesium");
apexParameterNameMap.set("mg", "magnesium");
apexParameterNameMap.set("3_0", "phosphate");
apexParameterNameMap.set("po4", "phosphate");
apexParameterNameMap.set("3_1", "nitrate");
apexParameterNameMap.set("no3", "nitrate");

export async function getAllApexParameterReadings(
  host: string,
  username: string,
  password: string,
  startDay: string,
  numDays: number,
  includeCurrentStatus?: boolean,
): Promise<ApexParameterReading[]> {
  const requests: (
    | Promise<ILogResponse>
    | Promise<TLogResponse>
    | Promise<StatusResponse>
  )[] = [
    getILog(host, username, password, startDay, numDays),
    getTLog(host, username, password, startDay, numDays),
  ];

  if (includeCurrentStatus) {
    requests.push(getStatus(host, username, password));
  }

  const results = await Promise.all(requests);
  const readings: ApexParameterReading[] = [];

  const iLog = results[0] as ILogResponse;
  iLog.ilog.record.forEach((record) => {
    record.data.forEach((data) => {
      const parameterName = apexParameterNameMap.get(data.type);
      if (!parameterName) return;
      readings.push({
        time: record.date,
        parameter: parameterName,
        value: data.value,
      });
    });
  });

  const tLog = results[1] as TLogResponse;
  tLog.tlog.record.map((record) => {
    const parameterName = apexParameterNameMap.get(record.did);
    if (!parameterName) return;
    readings.push({
      time: record.date,
      parameter: parameterName,
      value: record.value,
    });
  });

  if (includeCurrentStatus) {
    const status = results[2] as StatusResponse;
    const time = new Date();
    status.inputs.forEach((input) => {
      const parameterName = apexParameterNameMap.get(input.type);
      if (!parameterName) return;
      // Only use the parameters that are constantly measured by probes
      if (!["temperature", "ph"].includes(parameterName)) return;
      readings.push({
        time,
        parameter: parameterName,
        value: input.value,
      });
    });
  }

  return readings;
}
