import { Project, projects, terms } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { count, eq } from "drizzle-orm";
import { db } from "../db";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { revalidatePath } from "next/cache";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type ProjectWithCount = Project & { count: number };
async function getData(): Promise<ProjectWithCount[]> {
  const p = await db.select().from(projects);
  const t = await Promise.all(
    p.map(async (project) => ({
      ...project,
      count: (
        await db
          .select({ value: count() })
          .from(terms)
          .where(eq(terms.projectId, project.id))
      )[0].value,
    }))
  );
  return t;
}

export default async function ProjectsPage() {
  const projectsData = await getData();
  return (
    <main className=" ">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      </div>
      <div className="grid grid-cols-4 items-center gap-3">
        {projectsData.map((project) => (
          <Card key={project.id}>
            <Link href={`/translations/${project.id}/${project.refLang}`}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>EN, CZ</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{project.count} terms</p>
              </CardContent>
            </Link>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your project and all translations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form
                      action={async () => {
                        "use server";
                        await db
                          .delete(projects)
                          .where(eq(projects.id, project.id));
                        // get current path and revalidate
                        revalidatePath(`/translations/settings`);
                      }}
                    >
                      <AlertDialogAction type="submit">
                        Continue
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
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
