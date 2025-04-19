import z from "zod";
import { apiGet } from "./ApiCall";

export type Tank = {
  id: number;
  name: string;
  apexHost: string | null;
};

const TankSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  apexHost: z.string().nullable(),
});

const TankArraySchema = z.array(TankSchema);

export async function fetchTanks(): Promise<Tank[]> {
  return await apiGet<Tank[]>("/tanks", TankArraySchema);
}
