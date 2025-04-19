import z from "zod";
import { apiGet } from "./ApiCall";

export type ParameterGoal = {
  id: number;
  tankId: number;
  parameterId: number;
  lowLimit: number;
  highLimit: number;
};

const ParameterGoalSchema = z.object({
  id: z.coerce.number().int(),
  tankId: z.coerce.number().int(),
  parameterId: z.coerce.number().int(),
  lowLimit: z.coerce.number(),
  highLimit: z.coerce.number(),
});

export async function fetchParameterGoal(options: {
  tankId: number;
  parameterId: number;
}): Promise<ParameterGoal | null> {
  return await apiGet<ParameterGoal>(
    `/parameter-goals?tankId=${options.tankId}&parameterId=${options.parameterId}`,
    ParameterGoalSchema,
  );
}
