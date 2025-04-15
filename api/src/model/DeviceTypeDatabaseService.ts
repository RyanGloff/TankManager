import { DatabaseService, Transformation } from "./DatabaseService";

type DeviceType = {
  id: number;
  name: string;
};

type CreateDeviceTypeData = {
  name: string;
};

type UpdateDeviceTypeData = {
  name?: string;
};

const transformations: Transformation[] = [];

export class DeviceTypeDatabaseService extends DatabaseService<
  DeviceType,
  CreateDeviceTypeData,
  UpdateDeviceTypeData
> {
  private constructor() {
    super("tank_data_schema.device_type", "DeviceType", transformations);
  }

  private static instance: DeviceTypeDatabaseService =
    new DeviceTypeDatabaseService();

  static getInstance(): DeviceTypeDatabaseService {
    return DeviceTypeDatabaseService.instance;
  }
}
