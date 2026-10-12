import { Hono } from "hono";
import { asc, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { getDb } from "../db";
import { orders, customers, variants, products, batches } from "../db/schema";
import {
  orderSchema,
  orderStatusUpdateSchema,
  idParam,
} from "@shared/schemas/operations";
import type { AppEnv } from "../types";
export const orderRoutes = new Hono<AppEnv>()
  .get("/", async (c) =>
    c.json(
      await getDb(c.env.DB)
        .select({
          id: orders.id,
          orderCode: orders.orderCode,
          customerId: orders.customerId,
          customerName: customers.name,
          variantId: orders.variantId,
          productName: products.name,
          sku: variants.sku,
          size: variants.size,
          quantity: orders.quantity,
          dueDate: orders.dueDate,
          status: orders.status,
          notes: orders.notes,
        })
        .from(orders)
        .innerJoin(customers, eq(orders.customerId, customers.id))
        .innerJoin(variants, eq(orders.variantId, variants.id))
        .innerJoin(products, eq(variants.productId, products.id))
        .orderBy(asc(orders.dueDate)),
    ),
  )
  .post("/", zValidator("json", orderSchema), async (c) => {
    const db = getDb(c.env.DB),
      input = c.req.valid("json");
    const [customer, variant] = await Promise.all([
      db
        .select()
        .from(customers)
        .where(eq(customers.id, input.customerId))
        .get(),
      db.select().from(variants).where(eq(variants.id, input.variantId)).get(),
    ]);
    if (!customer || !variant)
      return c.json({ error: "Érvénytelen ügyfél vagy kiszerelés." }, 400);
    return c.json(
      (
        await db
          .insert(orders)
          .values({
            ...input,
            orderCode: `REN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          })
          .returning()
      )[0],
      201,
    );
  })
  .patch(
    "/:id/status",
    zValidator("param", idParam),
    zValidator("json", orderStatusUpdateSchema),
    async (c) => {
      const db = getDb(c.env.DB),
        id = c.req.valid("param").id,
        { status } = c.req.valid("json");
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .get();
      if (!order) return c.json({ error: "A rendelés nem található." }, 404);
      if (order.status === status) return c.json(order);
      if (order.status === "fulfilled" || order.status === "cancelled")
        return c.json(
          { error: "A lezárt rendelés állapota már nem módosítható." },
          409,
        );
      const linked = await db
        .select()
        .from(batches)
        .where(eq(batches.orderId, id));
      if (
        status === "fulfilled" &&
        (order.status !== "confirmed" ||
          linked
            .filter((b) => b.status === "closed")
            .reduce((sum, b) => sum + b.quantity, 0) < order.quantity)
      )
        return c.json(
          {
            error:
              "Teljesítéshez visszaigazolt rendelés és elegendő lezárt gyártás szükséges.",
          },
          409,
        );
      if ((status === "draft" || status === "cancelled") && linked.length > 0)
        return c.json(
          {
            error: "Kapcsolódó gyártás mellett a rendelés nem vonható vissza.",
          },
          409,
        );
      return c.json(
        (
          await db
            .update(orders)
            .set({ status })
            .where(eq(orders.id, id))
            .returning()
        )[0],
      );
    },
  );
