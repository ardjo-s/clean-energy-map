import { z } from "zod";

// Dormant V2 extension contract. Nothing in V1 imports this into a user-facing surface.
// Targets reuse V1 stable identifiers; finance never changes facility or project meaning.
export const financingTargetSchema = z.object({
  targetType: z.enum(["facility", "project", "phase", "organization", "portfolio"]),
  targetId: z.string().min(1),
  allocationStatus: z.enum(["direct", "published_allocation", "unallocated"]),
});

export const financingTransactionSchema = z.object({
  id: z.string().min(1),
  externalIdentifiers: z.record(z.string(), z.string()),
  scope: z.enum(["project", "phase", "facility", "corporate", "portfolio"]),
  status: z.enum([
    "rumored",
    "announced",
    "mandated",
    "signed",
    "closed",
    "partially_disbursed",
    "fully_disbursed",
    "refinanced",
    "cancelled",
    "repaid",
    "defaulted",
    "unknown",
  ]),
  originalAmount: z.number().nonnegative(),
  originalCurrency: z.string().length(3),
  committedAmount: z.number().nonnegative().nullable(),
  drawnAmount: z.number().nonnegative().nullable(),
  outstandingAmount: z.number().nonnegative().nullable(),
  dates: z.record(z.string(), z.string().date().nullable()),
  targets: z.array(financingTargetSchema).min(1),
  sourceObservationIds: z.array(z.string()).min(1),
});

export type FinancingTransaction = z.infer<typeof financingTransactionSchema>;
