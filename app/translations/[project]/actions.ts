"use server";

import { db } from "@/app/db";
import { Term, Translation, translations } from "@/app/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

export type TermWithTranslations = Term & { translations: Translation[] };

export async function translate(
  term: TermWithTranslations,
  lang: string,
  refLang: string
) {
  const originalText = `Translate "${
    term.translations.find((tr) => tr.lang === refLang)?.translation
  }" from ${refLang} into ${lang}`;
  const openai = new OpenAI({
    apiKey: process.env["OPEN_API_KEY"], // This is the default and can be omitted
  });
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: originalText }],
    model: "gpt-4",
  });

  await saveTranslation(
    term,
    lang,
    chatCompletion.choices[0].message.content?.replaceAll('"', "") ?? ""
  );
  revalidatePath(`/translations/${term.projectId}/${lang}`);
}

export async function saveTranslation(
  term: Term,
  lang: string,
  translation: string
) {
  const exitingTranslation = await db.query.translations.findFirst({
    where: and(eq(translations.termId, term.id), eq(translations.lang, lang)),
  });
  if (exitingTranslation) {
    await db
      .update(translations)
      .set({ translation })
      .where(eq(translations.id, exitingTranslation.id));
    return;
  }
  await db.insert(translations).values({ termId: term.id, lang, translation });
  revalidatePath(`/translations/${term.projectId}/${lang}`);
}
