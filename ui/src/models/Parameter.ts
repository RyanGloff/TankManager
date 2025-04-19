import z from "zod";
import { apiGet } from "./ApiCall";

export type Parameter = {
  id: number;
  name: string;
  apexName: string | null;
};

const ParameterSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  apexName: z.string().nullable(),
});

const ParameterArraySchema = z.array(ParameterSchema);

export async function fetchParameters(): Promise<Parameter[]> {
  return await apiGet<Parameter[]>("/parameters", ParameterArraySchema);
}
