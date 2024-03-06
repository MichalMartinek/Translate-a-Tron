import { db } from "@/app/db";
import { Project, projects, terms } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { and, count, eq } from "drizzle-orm";

async function getTermsWithTranslation(projectId: number) {
  console.log("Getting data");
  const res = await db.query.terms.findMany({
    where: eq(terms.projectId, projectId),
    with: {
      translations: true,
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
  params: { project: string };
}) {
  const project = await getProject(Number(params.project));
  console.log(project);
  if (!project) {
    return <div>Project not found</div>;
  }
  let translations = await getTermsWithTranslation(project.id);
  console.log(translations);
  return (
    <main className="min-h-screen p-24">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
      </div>
      <ul>
        {translations.map((term) => (
          <li key={project.id}>
            {term.term} - {term.translations?.length ?? 0} translations
          </li>
        ))}
      </ul>

      <AddTerm projectId={project.id} />
    </main>
  );
}

function AddTerm({ projectId }: { projectId: number }) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        console.log(formData.get("term"));
        const term = (formData.get("term") as string) ?? "";
        const alreadyExists = await db
          .select({ value: count() })
          .from(terms)
          .where(and(eq(terms.term, term), eq(terms.projectId, projectId)));
        console.log(alreadyExists);
        if (alreadyExists[0].value === 0) {
          await db.insert(terms).values({ term, projectId });
        }
      }}
    >
      <input name="term" placeholder="New Term" />

      <Button type="submit">Add</Button>
    </form>
  );
}
