import z from "zod";

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
  return fetch(
    `http://192.168.55.12:8080/api/parameter-readings/latest?tankId=${options.tankId}&parameterId=${options.parameterId}`,
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

export async function fetchParameterReadingHistory(options: {
  tankId: number;
  parameterId: number;
  numDays: number;
}): Promise<ParameterReading[]> {
  return fetch(
    `http://192.168.55.12:8080/api/parameter-readings/history?tankId=${options.tankId}&parameterId=${options.parameterId}&numDays=${options.numDays}`,
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request returned error code: ${response.status}`);
    }
    const raw = await response.json();
    const result = ParameterReadingArraySchema.parse(raw);
    return result;
  });
}
