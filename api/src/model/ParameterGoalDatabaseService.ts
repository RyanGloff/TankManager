import { DatabaseService, DatabaseError } from "./DatabaseService";

type ParameterGoal = {
  id: number;
  tankId: number;
  parameterId: number;
  lowLimit: number;
  highLimit: number;
};

type CreateParameterGoalData = {
  tankId: number;
  parameterId: number;
  lowLimit: number;
  highLimit: number;
};
type UpdateParameterGoalData = {
  lowLimit: number;
  highLimit: number;
};

const transformations = [
  { dbName: "tank_id", apiName: "tankId" },
  { dbName: "parameter_id", apiName: "parameterId" },
  { dbName: "low_limit", apiName: "lowLimit" },
  { dbName: "high_limit", apiName: "highLimit" },
];

export class ParameterGoalDatabaseService extends DatabaseService<
  ParameterGoal,
  CreateParameterGoalData,
  UpdateParameterGoalData
> {
  private constructor() {
    super("tank_data_schema.parameter_goal", "ParameterGoal", transformations);
  }

  private static instance: ParameterGoalDatabaseService =
    new ParameterGoalDatabaseService();

  static getInstance(): ParameterGoalDatabaseService {
    return ParameterGoalDatabaseService.instance;
  }

  async getGoalByTankAndParameter(
    tankId: number,
    parameterId: number,
  ): Promise<ParameterGoal | null> {
    try {
      const result = await DatabaseService.pool.query(
        `SELECT * FROM ${this.tableName} WHERE tank_id = $1 AND parameter_id = $2 ORDER BY id DESC LIMIT 1;`,
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
}
