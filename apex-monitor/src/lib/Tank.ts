import { z } from "zod";
import { apiGet } from "./ApiCall";

export type Tank = {
  id?: number;
  name: string;
  apexHost: string | null;
};

const TankSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  apexHost: z.string().nullable(),
});

export async function getTanks(): Promise<Tank[]> {
  return apiGet<Tank[]>("/tanks", z.array(TankSchema));
}
