import { z } from "zod";
import { batchStatusSchema } from "./batch";
export const idSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);
export const idParam = z.object({ id: idSchema });
export const dateSchema = z.iso.date();
export const productSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    category: z.string().trim().min(1).max(60),
    description: z.string().trim().max(2000),
  })
  .strict();
export const variantSchema = z
  .object({
    productId: idSchema,
    sku: z.string().trim().min(1).max(40),
    size: z.string().trim().min(1).max(40),
    unitPriceHuf: z.number().int().min(0).max(1000000),
  })
  .strict();
export const orderStatusSchema = z.enum([
  "draft",
  "confirmed",
  "fulfilled",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Piszkozat",
  confirmed: "Visszaigazolt",
  fulfilled: "Teljesített",
  cancelled: "Lemondott",
};
export const orderSchema = z
  .object({
    customerId: idSchema,
    variantId: idSchema,
    quantity: z.number().int().min(1).max(1000000),
    dueDate: dateSchema,
    notes: z.string().trim().max(2000),
  })
  .strict();
export const orderStatusUpdateSchema = z
  .object({ status: orderStatusSchema })
  .strict();
export const batchCreateSchema = z
  .object({
    variantId: idSchema,
    orderId: idSchema.nullable(),
    ownerId: idSchema,
    quantity: z.number().int().min(1).max(1000000),
    plannedDate: dateSchema,
    notes: z.string().trim().max(2000),
  })
  .strict();
export const batchUpdateSchema = batchCreateSchema.extend({
  status: batchStatusSchema,
});
export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type BatchInput = z.infer<typeof batchCreateSchema>;
export type BatchUpdate = z.infer<typeof batchUpdateSchema>;
export function todayInBudapest() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
