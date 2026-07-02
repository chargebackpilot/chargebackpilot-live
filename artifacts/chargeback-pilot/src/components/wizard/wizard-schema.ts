import { z } from "zod";

export const wizardSchema = z.object({
  paymentMethod: z.string().min(1, "Bitte wähle eine Zahlungsart aus."),
  problemType: z.string().min(1, "Bitte wähle einen Problemtyp aus."),
  merchantName: z.string().min(2, "Bitte gib den Namen des Händlers an."),
  purchaseAmount: z.string().optional(),
  disputedAmount: z.string().min(1, "Bitte gib den streitigen Betrag an."),
  paymentDate: z.string().min(1, "Bitte gib das Kaufdatum an."),
  merchantCountry: z.string().optional(),
  merchantContacted: z.boolean().default(false),
  merchantResponseType: z.string().optional(),
  merchantResponseNote: z.string().optional(),
  evidence: z.array(z.string()).default([]),
  evidenceStatus: z.record(z.string(), z.enum(["have", "later", "missing"])).default({}),
  structuredAnswers: z.record(z.string(), z.string()).default({}),
});

export type WizardFormData = z.infer<typeof wizardSchema>;
