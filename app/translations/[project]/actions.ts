"use server";

import { db } from "@/app/db";
import { translations } from "@/app/schema";
import { and, eq } from "drizzle-orm";

export async function saveTranslation(
  termId: number,
  lang: string,
  translation: string
) {
  const exitingTranslation = await db.query.translations.findFirst({
    where: and(eq(translations.termId, termId), eq(translations.lang, lang)),
  });
  if (exitingTranslation) {
    await db.update(translations).set({ translation }).where(eq(translations.id, exitingTranslation.id));
    return;
  }
  await db.insert(translations).values({ termId, lang, translation });
}
