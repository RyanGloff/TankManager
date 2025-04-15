import { DatabaseService } from "./DatabaseService";

type Tank = {
  id: number;
  name: string;
  apexHost: string | null;
};

type CreateTankData = {
  name: string;
  apexHost?: string;
};

const transformations = [{ dbName: "apex_host", apiName: "apexHost" }];

export class TankDatabaseService extends DatabaseService<
  Tank,
  CreateTankData,
  CreateTankData
> {
  private constructor() {
    super("tank_data_schema.tank", "Tank", transformations);
  }

  private static instance: TankDatabaseService = new TankDatabaseService();

  static getInstance(): TankDatabaseService {
    return TankDatabaseService.instance;
  }
}
