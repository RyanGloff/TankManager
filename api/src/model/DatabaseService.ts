import { Pool, QueryResultRow, types } from "pg";
import * as dotenv from "dotenv";

// Sets pg to return Date objects instead of strings
const TIMESTAMP_WITHOUT_TIME_ZONE_CODE = 1114;
const TIMESTAMP_WITH_TIME_ZONE_CODE = 1184;
const DATE_CODE = 1184;
types.setTypeParser(
  TIMESTAMP_WITHOUT_TIME_ZONE_CODE,
  (val: string): Date => new Date(val),
);
types.setTypeParser(
  TIMESTAMP_WITH_TIME_ZONE_CODE,
  (val: string): Date => new Date(val),
);
types.setTypeParser(DATE_CODE, (val: string): Date => new Date(val));

export type DBConfig = {
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
};

export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyExistsError";
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, id: number) {
    super(`${entity} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export type Transformation = {
  dbName: string;
  apiName: string;
};

export class DatabaseService<T, CreateType, UpdateType> {
  protected static pool: Pool;

  protected dbToApiTransformations: Map<string, Transformation>;
  protected apiToDbTransformations: Map<string, Transformation>;

  constructor(
    protected tableName: string,
    protected entityName: string,
    transformations: Transformation[],
  ) {
    this.dbToApiTransformations = transformations.reduce((agg, curr) => {
      agg.set(curr.dbName, curr);
      return agg;
    }, new Map<string, Transformation>());
    this.apiToDbTransformations = transformations.reduce((agg, curr) => {
      agg.set(curr.apiName, curr);
      return agg;
    }, new Map<string, Transformation>());
    if (!DatabaseService.pool) {
      dotenv.config();
      const config = {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
      };
      console.log(
        `Starting up pg connection pool with config: ${JSON.stringify(config)}`,
      );
      DatabaseService.pool = new Pool({
        connectionString: `postgresql://${config.username}:${config.password}@${config.host}${config.port ? `:${config.port}` : ""}/${config.database}`,
      });
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const result = await DatabaseService.pool.query(
        `SELECT * FROM ${this.tableName};`,
      );
      return result.rows.map((v) => this.toApi(v));
    } catch (err) {
      throw new DatabaseError(`Failed to fetch all ${this.entityName}`, err);
    }
  }

  async getById(id: number): Promise<T> {
    try {
      const result = await DatabaseService.pool.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1;`,
        [id],
      );
      if (result.rows.length === 0) {
        throw new NotFoundError(this.entityName, id);
      }
      return this.toApi(result.rows[0]);
    } catch (err) {
      throw new DatabaseError(`Failed to fetch ${this.entityName} by id`, err);
    }
  }

  async create(data: CreateType): Promise<T> {
    const entries = Object.entries(this.toDb(data));
    const keys = entries.map(([k]) => k);
    const values = entries.map(([_, v]) => v);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *;`;
    try {
      const result = await DatabaseService.pool.query(query, values);
      return this.toApi(result.rows[0]);
    } catch (err) {
      if ((err as { detail: string }).detail.includes("already exists")) {
        throw new AlreadyExistsError(`${this.entityName} already exists`);
      }
      throw new DatabaseError(`Failed to create ${this.entityName}`, err);
    }
  }

  async updateById(id: number, updates: UpdateType): Promise<T> {
    try {
      const keys = Object.keys(this.toDb(updates));
      if (keys.length === 0) {
        return this.getById(id);
      }

      const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
      const values = Object.values(this.toDb(updates));
      values.push(id);

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${values.length} RETURNING *;`;
      const result = await DatabaseService.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundError(this.entityName, id);
      }

      return this.toApi(result.rows[0]);
    } catch (err) {
      throw new DatabaseError(`Failed to update ${this.entityName}`, err);
    }
  }

  async deleteById(id: number): Promise<void> {
    try {
      const result = await DatabaseService.pool.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id;`,
        [id],
      );
      if (result.rowCount === 0) {
        throw new NotFoundError(this.entityName, id);
      }
    } catch (err) {
      throw new DatabaseError(`Failed to delete ${this.entityName}`, err);
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await DatabaseService.pool.query(`DELETE FROM ${this.tableName};`);
    } catch (err) {
      throw new DatabaseError(`Failed to delete ${this.entityName}`, err);
    }
  }

  protected toApi(res: QueryResultRow): T {
    const apiFields: Record<string, any> = {};
    Object.entries(res).forEach((entry) => {
      const transformation =
        this.dbToApiTransformations.get(entry[0]) || ({} as Transformation);
      const apiFieldName = transformation?.apiName || entry[0];
      const value = entry[1];
      apiFields[apiFieldName] = value;
    });
    return apiFields as T;
  }

  protected toDb<S>(api: S): Record<string, any> {
    const dbFields: Record<string, any> = {};
    Object.entries(api as Record<keyof S, S[keyof S]>).forEach((entry) => {
      const transformation =
        this.apiToDbTransformations.get(entry[0]) || ({} as Transformation);
      const dbFieldName = transformation?.dbName || entry[0];
      const value = entry[1];
      dbFields[dbFieldName] = value;
    });
    return dbFields;
  }

  static async close(): Promise<void> {
    await DatabaseService.pool.end();
  }
}
