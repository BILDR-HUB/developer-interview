import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";
// Kizárólag helyi interjúkörnyezet. Ez nem éles hitelesítés.
export const localOnly = createMiddleware<AppEnv>(async (c, next) => {
  const hostname = new URL(c.req.url).hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
    return c.json(
      { error: "Ez az interjúalkalmazás csak localhoston használható." },
      403,
    );
  }
  const origin = c.req.header("Origin");
  if (origin && origin !== new URL(c.req.url).origin) {
    return c.json({ error: "Eltérő eredetű kérés nem engedélyezett." }, 403);
  }
  c.set("actorId", 1);
  await next();
});
