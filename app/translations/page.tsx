import { Project, projects, terms } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { count, eq } from "drizzle-orm";
import { db } from "../db";
import Link from "next/link";
import { Container } from "lucide-react";
import { cn } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

async function getData(): Promise<Project[]> {
  const res = await db.select().from(projects);

  return res;
}

export default async function ProjectsPage() {
  const projects = await getData();
  return (
    <main className=" ">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      </div>
      <ul className="space-y-1 list-disc list-inside">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/translations/${project.id}/${project.refLang}`}
              className={cn("text-lg hover:underline hover:text-emerald-700")}
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="text-l font-bold tracking-tight mb-4 mt-8">
        Create new project
      </h2>
      <CreateNewProject />
    </main>
  );
}

function CreateNewProject() {
  return (
    <form
      className="flex w-full max-w-sm items-end gap-1.5"
      action={async (formData: FormData) => {
        "use server";
        let name = formData.get("name") as string;
        let refLang = formData.get("refLang") as string;
        await db.insert(projects).values({ name, refLang });
        // get current path and revalidate
        revalidatePath(`/translations`);
      }}
    >
      <div className="grid items-center gap-1.5">
        <Label htmlFor="name" className="ml-3">
          Project name
        </Label>
        <Input name="name" placeholder="Name" />
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="refLang" className="ml-3">
          Reference language
        </Label>
        <Input name="refLang" placeholder="e.g. en, cs" />
      </div>
      <Button type="submit">Create</Button>
    </form>
  );
}
