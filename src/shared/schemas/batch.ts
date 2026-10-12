import { z } from "zod";
export const batchStatusSchema = z.enum([
  "planned",
  "mixing",
  "qc",
  "filling",
  "boxing",
  "closed",
]);
export type BatchStatus = z.infer<typeof batchStatusSchema>;
export const batchStatusLabels: Record<BatchStatus, string> = {
  planned: "Tervezett",
  mixing: "Keverés",
  qc: "Minőségellenőrzés",
  filling: "Töltés",
  boxing: "Csomagolás",
  closed: "Lezárt",
};
// Meglévő szerkesztési példa. A jelölt új feladatmodulja külön adatkört kapjon.
export const updateBatchNoteSchema = z
  .object({ notes: z.string().trim().max(2000) })
  .strict();
