import { z } from "zod";
import { apiPost, AlreadyExistsError } from "./ApiCall";

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
    return await apiPost<ParameterReading>(
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
