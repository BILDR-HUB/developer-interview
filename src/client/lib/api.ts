import { hc } from "hono/client";
import type { AppType } from "@server/index";
export const api = hc<AppType>("/");
export async function readJson<T>(response: {
  ok: boolean;
  json: () => Promise<unknown>;
}): Promise<T> {
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
        ? body.error
        : "Nem sikerült a kérés.",
    );
  return body as T;
}
