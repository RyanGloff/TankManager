import { ZodSchema } from "zod";

const apiHost = import.meta.env.VITE_API_HOST;
const apiPort = import.meta.env.VITE_API_PORT;
const apiBasePath = import.meta.env.VITE_API_BASE_PATH;

const baseUrl = `http://${apiHost}:${apiPort}${apiBasePath}`;

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function apiGet<T>(path: string, schema: ZodSchema): Promise<T> {
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

export async function apiPost<T>(
  path: string,
  body: T,
  schema: ZodSchema,
): Promise<T> {
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
