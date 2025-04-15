import z from "zod";

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
  return fetch("http://192.168.55.12:8080/api/parameters").then(
    async (response) => {
      if (!response.ok) {
        throw new Error(`Request returned error code: ${response.status}`);
      }

      const raw = await response.json();
      return ParameterArraySchema.parse(raw);
    },
  );
}
