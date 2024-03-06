import { Project, projects, terms } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { count, eq } from "drizzle-orm";
import { db } from "../db";
import Link from "next/link";
import { Container } from "lucide-react";
import { cn } from "@/lib/utils";

async function getData(): Promise<Project[]> {
  const res = await db.select().from(projects);

  return res;
}

export default async function ProjectsPage() {
  const projects = await getData();
  console.log(projects);
  return (
    <main className="min-h-screen p-24">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      </div>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/translations/${project.id}`}
              className={cn("text-lg hover:underline hover:text-emerald-700")}
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
