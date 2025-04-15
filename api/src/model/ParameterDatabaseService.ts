import { DatabaseService } from "./DatabaseService";

type Parameter = {
  id: number;
  name: string;
  apexName: string | null;
};

type CreateParameterData = {
  name: string;
  apexName?: string;
};

type UpdateParameterData = {
  apexName?: string;
};

const transformations = [{ dbName: "apex_name", apiName: "apexName" }];

export class ParameterDatabaseService extends DatabaseService<
  Parameter,
  CreateParameterData,
  UpdateParameterData
> {
  private constructor() {
    super("tank_data_schema.parameter", "Parameter", transformations);
  }

  private static instance: ParameterDatabaseService =
    new ParameterDatabaseService();

  static getInstance(): ParameterDatabaseService {
    return ParameterDatabaseService.instance;
  }
}
