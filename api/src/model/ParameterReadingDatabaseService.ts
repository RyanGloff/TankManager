import { DatabaseService, DatabaseError } from "./DatabaseService";

type ParameterReading = {
  id: number;
  tankId: number;
  parameterId: number;
  value: number;
  time: Date;
  showInDashboard: boolean;
};

type CreateParameterReadingData = {
  tankId: number;
  parameterId: number;
  value: number;
  time: Date;
  showInDashboard: boolean;
};
type UpdateParameterReadingData = {
  showInDashboard: boolean;
};

const transformations = [
  { dbName: "tank_id", apiName: "tankId" },
  { dbName: "parameter_id", apiName: "parameterId" },
  { dbName: "show_in_dashboard", apiName: "showInDashboard" },
];

export class ParameterReadingDatabaseService extends DatabaseService<
  ParameterReading,
  CreateParameterReadingData,
  UpdateParameterReadingData
> {
  private constructor() {
    super(
      "tank_data_schema.parameter_reading",
      "ParameterReading",
      transformations,
    );
  }

  private static instance: ParameterReadingDatabaseService =
    new ParameterReadingDatabaseService();

  static getInstance(): ParameterReadingDatabaseService {
    return ParameterReadingDatabaseService.instance;
  }

  async getLatestReading(
    tankId: number,
    parameterId: number,
  ): Promise<ParameterReading | null> {
    try {
      const result = await DatabaseService.pool.query(
        `SELECT * FROM ${this.tableName} WHERE tank_id = $1 AND parameter_id = $2 ORDER BY time DESC LIMIT 1;`,
        [tankId, parameterId],
      );
      if (result.rows.length === 0) {
        return null;
      }
      return super.toApi(result.rows[0]);
    } catch (err) {
      throw new DatabaseError(`Failed to fetch ${this.entityName} by id`, err);
    }
  }

  async getHistory(
    tankId: number,
    parameterId: number,
    numDays: number,
  ): Promise<ParameterReading[]> {
    try {
      const result = await DatabaseService.pool.query(
        `SELECT * FROM ${this.tableName} WHERE tank_id = $1 AND parameter_id = $2 AND time >= NOW() - ($3 * INTERVAL '1 day');`,
        [tankId, parameterId, numDays],
      );
      return result.rows.map((r) => super.toApi(r));
    } catch (err) {
      throw new DatabaseError(
        `Failed to fetch ${this.entityName} history. tankId: ${tankId} parameterId: ${parameterId} numDays: ${numDays}`,
        err,
      );
    }
  }
}
