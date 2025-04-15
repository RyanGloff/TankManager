import { DatabaseService, Transformation } from "./DatabaseService";

type DevicePowerTarget = {
  id: number;
  deviceId: number;
  startTime: string | null;
  endTime: string | null;
  desiredPowerState: boolean;
  enforceOnDiscrepancy: boolean;
  notifyOnDiscrepancy: boolean;
  minAcceptableDraw: number | null;
  maxAcceptableDraw: number | null;
};

type CreateDevicePowerTargetData = {
  deviceId: number;
  startTime?: string;
  endTime?: string;
  desiredPowerState: boolean;
  enforceOnDiscrepancy: boolean;
  notifyOnDiscrepancy: boolean;
  minAcceptableDraw?: number;
  maxAcceptableDraw?: number;
};

type UpdateDevicePowerTargetData = {
  startTime?: string;
  endTime?: string;
  desiredPowerState?: boolean;
  enforceOnDiscrepancy?: boolean;
  notifyOnDiscrepancy?: boolean;
  minAcceptableDraw?: number;
  maxAcceptableDraw?: number;
};

const transformations: Transformation[] = [
  { dbName: "device_id", apiName: "deviceId" },
  { dbName: "start_time", apiName: "startTime" },
  { dbName: "end_time", apiName: "endTime" },
  { dbName: "desired_power_state", apiName: "desiredPowerState" },
  { dbName: "enforce_on_discrepancy", apiName: "enforceOnDiscrepancy" },
  { dbName: "notify_on_discrepancy", apiName: "notifyOnDiscrepancy" },
  { dbName: "min_acceptable_draw", apiName: "minAcceptableDraw" },
  { dbName: "max_acceptable_draw", apiName: "maxAcceptableDraw" },
];

export class DevicePowerTargetDatabaseService extends DatabaseService<
  DevicePowerTarget,
  CreateDevicePowerTargetData,
  UpdateDevicePowerTargetData
> {
  private constructor() {
    super(
      "tank_data_schema.device_power_target",
      "DevicePowerTarget",
      transformations,
    );
  }

  private static instance: DevicePowerTargetDatabaseService =
    new DevicePowerTargetDatabaseService();

  static getInstance(): DevicePowerTargetDatabaseService {
    return DevicePowerTargetDatabaseService.instance;
  }
}
