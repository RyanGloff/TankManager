import z from "zod";

export type ParameterReading = {
  id: number;
  tankId: number;
  parameterId: number;
  lowLimit: number;
  highLimit: number;
};

const ParameterReadingSchema = z.object({
  id: z.coerce.number().int(),
  tankId: z.coerce.number().int(),
  parameterId: z.coerce.number().int(),
  lowLimit: z.coerce.number(),
  highLimit: z.coerce.number(),
});

export async function fetchParameterGoal(options: {
  tankId: number;
  parameterId: number;
}): Promise<ParameterReading | null> {
  return fetch(
    `http://192.168.55.12:8080/api/parameter-goals?tankId=${options.tankId}&parameterId=${options.parameterId}`,
  ).then(async (response) => {
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Request returned error code: ${response.status}`);
    }

    const raw = await response.json();
    const result = ParameterReadingSchema.parse(raw);
    return result;
  });
}
