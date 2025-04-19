import z from "zod";
import { apiGet } from "./ApiCall";

export type ParameterReading = {
  id: number;
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
  showInDashboard: z.boolean(),
});

const ParameterReadingArraySchema = z.array(ParameterReadingSchema);

export async function fetchLatestParameterReading(options: {
  tankId: number;
  parameterId: number;
}): Promise<ParameterReading | null> {
  return await apiGet<ParameterReading | null>(
    `/parameter-readings/latest?tankId=${options.tankId}&parameterId=${options.parameterId}`,
    ParameterReadingSchema.nullable(),
  );
}

export async function fetchParameterReadingHistory(options: {
  tankId: number;
  parameterId: number;
  numDays: number;
}): Promise<ParameterReading[]> {
  return await apiGet<ParameterReading[]>(
    `/parameter-readings/history?tankId=${options.tankId}&parameterId=${options.parameterId}&numDays=${options.numDays}`,
    ParameterReadingArraySchema,
  );
}
