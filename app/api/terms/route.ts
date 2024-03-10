import { db } from "@/app/db";
import { projects, tokens, terms } from "@/app/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export type MyData = {
  lang: string;
  projectId: number;
  sync?: boolean;
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
  const sync = payload.sync ?? false;
  console.log(payload.lang);
  console.log(payload.projectId);

  // TODO: check if the user has access to the project
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, payload.projectId),
  });
  console.log(project);
  if (!project) {
    return new NextResponse(JSON.stringify({ error: "Project not found" }), {
      status: 404,
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

  return new NextResponse(JSON.stringify({ stats }), {
    status: 200,
  });
}