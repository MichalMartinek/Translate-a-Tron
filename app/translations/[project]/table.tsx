"use client";
import TextareaAutosize from "react-textarea-autosize";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import { cn } from "@/lib/utils";

type TermWithTranslations = Term & { translations: Translation[] };

export default function TermsTable({
  project,
  terms,
}: {
  project: Project;
  terms: TermWithTranslations[];
}) {
  const [lang, setLang] = useState(project.refLang);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <Select
          value={lang}
          onValueChange={(newValue) => {
            console.log("new value", newValue);
            setLang(newValue);
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
            <TableHead>Ref translation</TableHead>
            <TableHead>Translation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((term) => (
            <TableRow key={term.id}>
              <TableCell className="font-medium">{term.term}</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>
                <TextareaAutosize
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  minRows={1}
                  onBlur={(e) => {
                    console.log("onBlur", e.target.value);
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
