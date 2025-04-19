import { z } from "zod";
import { apiGet } from "./ApiCall";

export type Parameter = {
  id?: number;
  name: string;
  apexName: string | null;
};

const ParameterSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  apexName: z.string().nullable(),
});

export async function getParameters(): Promise<Parameter[]> {
  return apiGet<Parameter[]>("/parameters", z.array(ParameterSchema));
}
