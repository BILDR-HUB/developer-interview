import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { batches, products, variants, orders, users } from "../db/schema";
import {
  updateBatchNoteSchema,
  batchStatusSchema,
} from "@shared/schemas/batch";
import {
  batchCreateSchema,
  batchUpdateSchema,
  idParam,
  type BatchInput,
} from "@shared/schemas/operations";
import type { AppEnv } from "../types";
async function validateReferences(
  db: ReturnType<typeof getDb>,
  input: BatchInput,
  existingOrderId?: number | null,
) {
  const [variant, owner, order] = await Promise.all([
    db.select().from(variants).where(eq(variants.id, input.variantId)).get(),
    db.select().from(users).where(eq(users.id, input.ownerId)).get(),
    input.orderId
      ? db.select().from(orders).where(eq(orders.id, input.orderId)).get()
      : undefined,
  ]);
  if (!variant || !owner) return "Érvénytelen kiszerelés vagy felelős.";
  if (input.orderId && (!order || order.variantId !== input.variantId))
    return "A rendelés és a kiszerelés nem tartozik össze.";
  if (order && order.status !== "confirmed" && order.id !== existingOrderId)
    return "Csak visszaigazolt rendeléshez indítható gyártás.";
  return null;
}
export const batchRoutes = new Hono<AppEnv>()
  .get("/", async (c) =>
    c.json(
      await getDb(c.env.DB)
        .select({
          id: batches.id,
          batchCode: batches.batchCode,
          variantId: batches.variantId,
          productId: variants.productId,
          productName: products.name,
          sku: variants.sku,
          size: variants.size,
          orderId: batches.orderId,
          orderCode: orders.orderCode,
          ownerId: batches.ownerId,
          ownerName: users.displayName,
          status: batches.status,
          quantity: batches.quantity,
          plannedDate: batches.plannedDate,
          notes: batches.notes,
        })
        .from(batches)
        .innerJoin(variants, eq(batches.variantId, variants.id))
        .innerJoin(products, eq(variants.productId, products.id))
        .innerJoin(users, eq(batches.ownerId, users.id))
        .leftJoin(orders, eq(batches.orderId, orders.id))
        .orderBy(desc(batches.plannedDate), desc(batches.id)),
    ),
  )
  .post("/", zValidator("json", batchCreateSchema), async (c) => {
    const db = getDb(c.env.DB),
      input = c.req.valid("json");
    const error = await validateReferences(db, input);
    if (error) return c.json({ error }, 400);
    return c.json(
      (
        await db
          .insert(batches)
          .values({
            ...input,
            status: "planned",
            batchCode: `GY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          })
          .returning()
      )[0],
      201,
    );
  })
  .put(
    "/:id",
    zValidator("param", idParam),
    zValidator("json", batchUpdateSchema),
    async (c) => {
      const db = getDb(c.env.DB),
        input = c.req.valid("json"),
        id = c.req.valid("param").id;
      const existing = await db
        .select()
        .from(batches)
        .where(eq(batches.id, id))
        .get();
      if (!existing)
        return c.json({ error: "A gyártási tétel nem található." }, 404);
      if (existing.status === "closed")
        return c.json(
          { error: "Lezárt gyártási tétel már nem módosítható." },
          409,
        );
      const current = batchStatusSchema.options.indexOf(existing.status),
        next = batchStatusSchema.options.indexOf(input.status);
      if (Math.abs(current - next) > 1)
        return c.json(
          {
            error:
              "Egyszerre csak egy gyártási lépést lehet előre vagy visszalépni.",
          },
          409,
        );
      if (
        existing.status !== "planned" &&
        (input.variantId !== existing.variantId ||
          input.orderId !== existing.orderId ||
          input.quantity !== existing.quantity)
      )
        return c.json(
          {
            error:
              "Elindított gyártásnál a kiszerelés, a rendelés és a mennyiség már nem módosítható.",
          },
          409,
        );
      const error = await validateReferences(db, input, existing.orderId);
      if (error) return c.json({ error }, 400);
      return c.json(
        (
          await db
            .update(batches)
            .set(input)
            .where(eq(batches.id, id))
            .returning()
        )[0],
      );
    },
  )
  .patch(
    "/:id/notes",
    zValidator("param", idParam),
    zValidator("json", updateBatchNoteSchema),
    async (c) => {
      const existing = await getDb(c.env.DB)
        .select()
        .from(batches)
        .where(eq(batches.id, c.req.valid("param").id))
        .get();
      if (existing?.status === "closed")
        return c.json(
          { error: "Lezárt gyártási tétel már nem módosítható." },
          409,
        );
      const [updated] = await getDb(c.env.DB)
        .update(batches)
        .set(c.req.valid("json"))
        .where(eq(batches.id, c.req.valid("param").id))
        .returning();
      return updated
        ? c.json(updated)
        : c.json({ error: "A gyártási tétel nem található." }, 404);
    },
  );
