import { db } from "@/app/db";
import { Project, projects, terms } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { auth } from "@/app/auth";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Table from "../table";

async function getTermsWithTranslation(projectId: number) {
  const res = await db.query.terms.findMany({
    where: eq(terms.projectId, projectId),
    with: {
      translations: {
        with: {
          updatedBy: true,
        },
      },
    },
  });

  return res;
}

async function getProject(id: number): Promise<Project | undefined> {
  const res = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  return res;
}

export default async function ProjectPage({
  params,
}: {
  params: { project: string; lang: string };
}) {
  let session = await auth();
  const userId = Number(session?.user?.id);
  const project = await getProject(Number(params.project));
  if (!project) {
    return <div>Project not found</div>;
  }
  const translations = await getTermsWithTranslation(project.id);
  return (
    <main className="">
      <Table
        terms={translations}
        project={project}
        choosedLang={params.lang}
        userId={userId}
      />
      <Separator className="my-4 mt-10" />
      <AddTerm projectId={project.id} lang={params.lang} />
    </main>
  );
}

function AddTerm({ projectId, lang }: { projectId: number; lang: string }) {
  return (
    <form
      className="flex space-x-4 w-full max-w-sm items-end gap-1.5"
      action={async (formData: FormData) => {
        "use server";
        const term = (formData.get("term") as string) ?? "";
        const alreadyExists = await db
          .select({ value: count() })
          .from(terms)
          .where(and(eq(terms.term, term), eq(terms.projectId, projectId)));
        if (alreadyExists[0].value === 0) {
          await db.insert(terms).values({ term, projectId });
        }
        // get current path and revalidate
        revalidatePath(`/translations/${projectId}/${lang}`);
      }}
    >
      <div className="grid items-center gap-1.5">
        <Label htmlFor="term">New term</Label>
        <Input name="term" placeholder="New Term" />
      </div>

      <Button type="submit">Add</Button>
    </form>
  );
}
