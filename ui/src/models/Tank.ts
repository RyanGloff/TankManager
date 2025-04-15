import z from "zod";

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
  return fetch("http://192.168.55.12:8080/api/tanks").then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request returned error code: ${response.status}`);
    }

    const raw = await response.json();
    return TankArraySchema.parse(raw);
  });
}
