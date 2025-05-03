import { ZodSchema } from "zod";

const baseUrl = `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}${process.env.API_BASE_PATH}`;

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type Bulk<T> = {
  values: T[];
};

export async function apiGet<T>(path: string, schema: ZodSchema): Promise<T> {
  console.log(`GET ${baseUrl}${path}`);
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get ${path}: ${response.status} ${JSON.stringify(error)}`,
    );
  }

  const raw = await response.json();
  const body = schema.parse(raw);
  return body as T;
}

export async function apiPost<T, R>(
  path: string,
  body: T,
  schema: ZodSchema,
): Promise<R> {
  console.log(`POST ${baseUrl}${path}`);
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new AlreadyExistsError(error.error.message);
    }
    throw new Error(
      `Failed to post ${path}: ${response.status} ${JSON.stringify(error)}`,
    );
  }

  const raw = await response.json();
  const data = schema.parse(raw);
  return data;
}
