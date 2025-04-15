import { DatabaseService, Transformation } from "./DatabaseService";

type Alarm = {
  id: number;
  name: string;
  parameterId: number;
  tankId: number;
  highLimit: number | null;
  lowLimit: number | null;
  severity: number;
};

type CreateAlarmData = {
  name: string;
  parameterId: number;
  tankId: number;
  highLimit?: number | null;
  lowLimit?: number | null;
  severity: number;
};

type UpdateAlarmData = {
  name?: string;
  highLimit?: number | null;
  lowLimit?: number | null;
  severity?: number;
};

const transformations: Transformation[] = [
  { dbName: "parameter_id", apiName: "parameterId" },
  { dbName: "tank_id", apiName: "tankId" },
  { dbName: "high_limit", apiName: "highLimit" },
  { dbName: "low_limit", apiName: "lowLimit" },
];

export class AlarmDatabaseService extends DatabaseService<
  Alarm,
  CreateAlarmData,
  UpdateAlarmData
> {
  private constructor() {
    super("tank_data_schema.alarm", "Alarm", transformations);
  }

  private static instance: AlarmDatabaseService = new AlarmDatabaseService();

  static getInstance(): AlarmDatabaseService {
    return AlarmDatabaseService.instance;
  }
}
