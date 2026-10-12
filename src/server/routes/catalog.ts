import { Hono } from "hono";
import { asc, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { getDb } from "../db";
import { products, users, variants, customers } from "../db/schema";
import {
  productSchema,
  variantSchema,
  idParam,
} from "@shared/schemas/operations";
import type { AppEnv } from "../types";
export const catalogRoutes = new Hono<AppEnv>()
  .get("/users", async (c) =>
    c.json(
      await getDb(c.env.DB)
        .select()
        .from(users)
        .orderBy(asc(users.displayName)),
    ),
  )
  .get("/users/me", async (c) => {
    const [user] = await getDb(c.env.DB)
      .select()
      .from(users)
      .where(eq(users.id, c.get("actorId")));
    return user
      ? c.json(user)
      : c.json({ error: "Futtasd az npm run setup parancsot." }, 404);
  })
  .get("/customers", async (c) =>
    c.json(
      await getDb(c.env.DB)
        .select()
        .from(customers)
        .orderBy(asc(customers.name)),
    ),
  )
  .get("/products", async (c) =>
    c.json(
      await getDb(c.env.DB).select().from(products).orderBy(asc(products.name)),
    ),
  )
  .post("/products", zValidator("json", productSchema), async (c) =>
    c.json(
      (
        await getDb(c.env.DB)
          .insert(products)
          .values(c.req.valid("json"))
          .returning()
      )[0],
      201,
    ),
  )
  .put(
    "/products/:id",
    zValidator("param", idParam),
    zValidator("json", productSchema),
    async (c) => {
      const [row] = await getDb(c.env.DB)
        .update(products)
        .set(c.req.valid("json"))
        .where(eq(products.id, c.req.valid("param").id))
        .returning();
      return row
        ? c.json(row)
        : c.json({ error: "A termék nem található." }, 404);
    },
  )
  .get("/variants", async (c) =>
    c.json(
      await getDb(c.env.DB)
        .select({
          id: variants.id,
          productId: variants.productId,
          productName: products.name,
          sku: variants.sku,
          size: variants.size,
          unitPriceHuf: variants.unitPriceHuf,
        })
        .from(variants)
        .innerJoin(products, eq(variants.productId, products.id))
        .orderBy(asc(products.name), asc(variants.id)),
    ),
  )
  .post("/variants", zValidator("json", variantSchema), async (c) => {
    const db = getDb(c.env.DB),
      input = c.req.valid("json");
    if (
      !(await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .get())
    )
      return c.json({ error: "A termék nem található." }, 400);
    return c.json(
      (await db.insert(variants).values(input).returning())[0],
      201,
    );
  })
  .put(
    "/variants/:id",
    zValidator("param", idParam),
    zValidator("json", variantSchema),
    async (c) => {
      const db = getDb(c.env.DB),
        input = c.req.valid("json"),
        id = c.req.valid("param").id;
      const existing = await db
        .select()
        .from(variants)
        .where(eq(variants.id, id))
        .get();
      if (!existing)
        return c.json({ error: "A kiszerelés nem található." }, 404);
      if (existing.productId !== input.productId)
        return c.json(
          { error: "A kiszerelés másik termékhez nem helyezhető át." },
          400,
        );
      return c.json(
        (
          await db
            .update(variants)
            .set(input)
            .where(eq(variants.id, id))
            .returning()
        )[0],
      );
    },
  );
