"use client";
import { Project, Term, Translation } from "@/app/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { saveTranslation } from "./actions";

type TermWithTranslations = Term & { translations: Translation[] };

export default function TermsTable({
  project,
  terms,
  choosedLang,
}: {
  project: Project;
  terms: TermWithTranslations[];
  choosedLang: string;
}) {
  const router = useRouter();

  const isNotRefLang = choosedLang !== project.refLang;
  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <Select
          value={choosedLang}
          onValueChange={(newValue) => {
            router.push(`/translations/${project.id}/${newValue}`);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cs">Czech</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Term</TableHead>
            {isNotRefLang && <TableHead>Ref translation</TableHead>}
            <TableHead>Translation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((term) => (
            <TableRow key={term.id}>
              <TableCell className="font-medium">{term.term}</TableCell>
              {isNotRefLang && (
                <TableCell>
                  {
                    term.translations.find((tr) => tr.lang === project.refLang)
                      ?.translation
                  }
                </TableCell>
              )}
              <TableCell>
                <TextareaAutosize
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  defaultValue={
                    term.translations.find((tr) => tr.lang === choosedLang)
                      ?.translation
                  }
                  minRows={1}
                  onBlur={async (e) => {
                    await saveTranslation(term.id, choosedLang, e.target.value);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
