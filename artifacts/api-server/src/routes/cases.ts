import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { CreateCaseBody, GetCaseParams } from "@workspace/api-zod";
import { eq, count, sql } from "drizzle-orm";
import { analyzeWithGemini } from "../lib/gemini-analysis";

const router = Router();

router.post("/cases", async (req, res) => {
  const parseResult = CreateCaseBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Ungültige Eingabedaten", details: parseResult.error.issues });
    return;
  }

  const data = parseResult.data;
  const evidence = (data.evidence as string[]) || [];

  const analysis = await analyzeWithGemini({
    paymentMethod: data.paymentMethod,
    problemType: data.problemType,
    merchantName: data.merchantName,
    amount: data.amount,
    paymentDate: data.paymentDate,
    merchantCountry: data.merchantCountry,
    merchantContacted: data.merchantContacted ?? false,
    merchantResponse: data.merchantResponse,
    evidence,
    description: data.description,
  });

  const [newCase] = await db
    .insert(casesTable)
    .values({
      paymentMethod: data.paymentMethod,
      problemType: data.problemType,
      merchantName: data.merchantName,
      amount: data.amount,
      paymentDate: data.paymentDate,
      merchantCountry: data.merchantCountry ?? null,
      merchantContacted: data.merchantContacted ?? false,
      merchantResponse: data.merchantResponse ?? null,
      evidence,
      description: data.description,
      analysis,
    })
    .returning();

  res.status(201).json({
    id: String(newCase.id),
    paymentMethod: newCase.paymentMethod,
    problemType: newCase.problemType,
    merchantName: newCase.merchantName,
    amount: newCase.amount,
    paymentDate: newCase.paymentDate,
    merchantCountry: newCase.merchantCountry,
    merchantContacted: newCase.merchantContacted,
    merchantResponse: newCase.merchantResponse,
    evidence: newCase.evidence,
    description: newCase.description,
    analysis: newCase.analysis,
    createdAt: newCase.createdAt.toISOString(),
  });
});

router.get("/cases/stats", async (req, res) => {
  const [totalResult] = await db.select({ count: count() }).from(casesTable);
  const total = Number(totalResult.count);

  const strengthCounts = await db
    .select({
      strength: sql<string>`${casesTable.analysis}->>'strength'`,
      count: count(),
    })
    .from(casesTable)
    .groupBy(sql`${casesTable.analysis}->>'strength'`);

  let strongCases = 0,
    mediumCases = 0,
    weakCases = 0;
  for (const row of strengthCounts) {
    if (row.strength === "stark") strongCases = Number(row.count);
    else if (row.strength === "mittel") mediumCases = Number(row.count);
    else if (row.strength === "schwach") weakCases = Number(row.count);
  }

  const paymentMethodCounts = await db
    .select({ method: casesTable.paymentMethod, count: count() })
    .from(casesTable)
    .groupBy(casesTable.paymentMethod)
    .limit(5);

  const problemTypeCounts = await db
    .select({ type: casesTable.problemType, count: count() })
    .from(casesTable)
    .groupBy(casesTable.problemType)
    .limit(5);

  res.json({
    totalCases: total,
    strongCases,
    mediumCases,
    weakCases,
    topPaymentMethods: paymentMethodCounts.map((r) => ({ method: r.method, count: Number(r.count) })),
    topProblemTypes: problemTypeCounts.map((r) => ({ type: r.type, count: Number(r.count) })),
  });
});

router.get("/cases/:id", async (req, res) => {
  const paramsResult = GetCaseParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const id = parseInt(paramsResult.data.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID muss eine Zahl sein" });
    return;
  }

  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!found) {
    res.status(404).json({ error: "Fall nicht gefunden" });
    return;
  }

  res.json({
    id: String(found.id),
    paymentMethod: found.paymentMethod,
    problemType: found.problemType,
    merchantName: found.merchantName,
    amount: found.amount,
    paymentDate: found.paymentDate,
    merchantCountry: found.merchantCountry,
    merchantContacted: found.merchantContacted,
    merchantResponse: found.merchantResponse,
    evidence: found.evidence,
    description: found.description,
    analysis: found.analysis,
    createdAt: found.createdAt.toISOString(),
  });
});

export default router;
