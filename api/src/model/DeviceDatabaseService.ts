import { DatabaseService, Transformation } from "./DatabaseService";

type Device = {
  id: number;
  name: string;
  host: string;
  childName: string | null;
  deviceTypeId: number;
};

type CreateDeviceData = {
  name: string;
  host: string;
  childName?: string;
  deviceTypeId: number;
};

type UpdateDeviceData = {
  name?: string;
  host?: string;
  childName?: string | null;
};

const transformations: Transformation[] = [
  { dbName: "child_name", apiName: "childName" },
];

export class DeviceDatabaseService extends DatabaseService<
  Device,
  CreateDeviceData,
  UpdateDeviceData
> {
  private constructor() {
    super("tank_data_schema.device", "Device", transformations);
  }

  private static instance: DeviceDatabaseService = new DeviceDatabaseService();

  static getInstance(): DeviceDatabaseService {
    return DeviceDatabaseService.instance;
  }
}
