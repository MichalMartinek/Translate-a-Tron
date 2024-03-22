import { db } from "@/app/db";
import { projects, tokens, terms, translations } from "@/app/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export enum Operation {
  SYNC = "sync",
  UPLOAD = "upload",
  DOWNLOAD = "download",
}
export type MyData = {
  lang: string;
  projectId: number;
  operation: Operation;
  data: {
    [key: string]: string;
  };
};

export async function POST(request: NextRequest) {
  const token =
    request.headers.get("Authorization")?.replace("Bearer ", "").trim() ?? "";
  const tokenInDb = await db.query.tokens.findFirst({
    where: and(eq(tokens.key, token), eq(tokens.expired, false)),
  });
  if (!token || !tokenInDb) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const payload: MyData = await request.json();
  const sync = payload.operation === Operation.SYNC;

  // TODO: check if the user has access to the project
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, payload.projectId),
  });
  if (!project) {
    return new NextResponse(JSON.stringify({ error: "Project not found" }), {
      status: 404,
    });
  }
  if (payload.operation === Operation.DOWNLOAD) {
    const termsInProject = await db.query.terms.findMany({
      where: eq(terms.projectId, payload.projectId),
      with: {
        translations: true,
      },
    });
    const data = termsInProject.reduce((acc, term) => {
      acc[term.term] =
        term.translations.find((t) => t.lang === payload.lang)?.translation ??
        "";
      return acc;
    }, {} as Record<string, string>);
    return new NextResponse(JSON.stringify(data), {
      status: 200,
    });
  }

  const stats = {
    added: 0,
    updated: 0,
    deleted: 0,
  };
  const foundTerms = await db.query.terms.findMany({
    where: eq(terms.projectId, payload.projectId),
    with: {
      translations: true,
    },
  });
  if (sync) {
    const termsOnlyInDb = foundTerms.filter(
      (term) => payload.data[term.term] === undefined
    );
    console.log("missing", termsOnlyInDb);
    if (termsOnlyInDb.length > 0) {
      await db.delete(terms).where(
        inArray(
          terms.id,
          termsOnlyInDb.map((t) => t.id)
        )
      );
      stats.deleted += termsOnlyInDb.length;
    }
  }
  const translationsToAdd = [];
  for (const [key, value] of Object.entries(payload.data)) {
    const termInDb = foundTerms.find((term) => term.term === key);
    if (termInDb) {
      if (
        !termInDb.translations.find((t) => t.lang === payload.lang) &&
        value
      ) {
        translationsToAdd.push({
          lang: payload.lang,
          termId: termInDb.id,
          translation: value,
        });
        stats.updated++;
      }
    } else if (sync) {
      const newTerm = await db
        .insert(terms)
        .values({
          projectId: payload.projectId,
          term: key,
        })
        .returning();
      translationsToAdd.push({
        lang: payload.lang,
        termId: newTerm[0].id,
        translation: value,
      });
      stats.added++;
    }
  }
  if (translationsToAdd.length > 0) {
    await db.insert(translations).values(translationsToAdd);
  }

  return new NextResponse(JSON.stringify({ stats }), {
    status: 200,
  });
}
