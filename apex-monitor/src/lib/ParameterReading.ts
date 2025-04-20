import { z } from "zod";
import { apiPost, AlreadyExistsError, Bulk } from "./ApiCall";

export type ParameterReading = {
  id?: number;
  tankId: number;
  parameterId: number;
  value: number;
  time: Date;
  showInDashboard: boolean;
};

const ParameterReadingSchema = z.object({
  id: z.coerce.number(),
  tankId: z.coerce.number(),
  parameterId: z.coerce.number(),
  value: z.coerce.number(),
  time: z.coerce.date(),
  showInDashboard: z.coerce.boolean(),
});

export async function storeParameterReading(
  pr: ParameterReading,
): Promise<ParameterReading | null> {
  try {
    return await apiPost<ParameterReading, ParameterReading>(
      "/parameter-readings",
      pr,
      ParameterReadingSchema,
    );
  } catch (err) {
    if (err instanceof AlreadyExistsError) {
      return null;
    }
    throw err;
  }
}

export async function storeParameterReadingBulk(
  prs: Bulk<ParameterReading>,
): Promise<ParameterReading[]> {
  // Not catching errors, Let them be caught up a level
  return await apiPost<Bulk<ParameterReading>, ParameterReading[]>(
    "/parameter-readings/bulk",
    prs,
    z.array(ParameterReadingSchema),
  );
}
