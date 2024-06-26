"use client";
import { Project, Term, Translation } from "@/app/schema";
import { toast } from "@/components/ui/use-toast";

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

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TermWithTranslations, saveTranslation, translate } from "./actions";
import { Input } from "@/components/ui/input";
import { getRelativeTimeString } from "@/lib/date";

enum OrderBy {
  UNTRANSLATED_FIRST = "UNTRANSLATED_FIRST",
  AI_GENERATED_FIRST = "AI_GENERATED_FIRST",
  A_Z = "A_Z",
  Z_A = "Z_A",
}
export default function TermsTable({
  project,
  terms,
  choosedLang,
  userId,
}: {
  project: Project;
  terms: TermWithTranslations[];
  choosedLang: string;
  userId: number;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderBy>(OrderBy.UNTRANSLATED_FIRST);
  const [search, setSearch] = useState("");

  const orderedTerms = terms
    .filter((term) => {
      if (!search) {
        return true;
      }
      return (
        term.term.toLowerCase().includes(search.toLowerCase()) ||
        term.translations.some(
          (tr) =>
            (tr.lang === choosedLang || tr.lang === project.refLang) &&
            tr.translation.toLowerCase().includes(search.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      const aTranslation =
        a.translations.find((tr) => tr.lang === choosedLang)?.translation || "";
      const bTranslation =
        b.translations.find((tr) => tr.lang === choosedLang)?.translation || "";
      if (order === OrderBy.AI_GENERATED_FIRST) {
        if (
          a.translations.find((tr) => tr.lang === choosedLang)?.generatedByAI &&
          !b.translations.find((tr) => tr.lang === choosedLang)?.generatedByAI
        ) {
          return -1;
        }
      }
      if (order === OrderBy.UNTRANSLATED_FIRST) {
        if (!aTranslation && bTranslation) {
          return -1;
        }
        if (aTranslation && !bTranslation) {
          return 1;
        }
      }
      if (order === OrderBy.Z_A) {
        return b.term.localeCompare(a.term);
      }
      return a.term.localeCompare(b.term);
    });

  const isNotRefLang = choosedLang !== project.refLang;
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="font-normal text-slate-400 mr-4">#{project.id}</span>
          {project.name}
        </h1>
        <div className="flex">
          <div className="grid items-center gap-1.5">
            <Label htmlFor="email" className="mb-1">
              Language
            </Label>
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

          <div className="grid items-center gap-1.5 ml-4">
            <Label htmlFor="email" className="mb-1">
              Order by
            </Label>
            <Select
              value={order}
              onValueChange={(newValue) => {
                setOrder(newValue as OrderBy);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderBy.UNTRANSLATED_FIRST}>
                  Untranslated first
                </SelectItem>
                <SelectItem value={OrderBy.AI_GENERATED_FIRST}>
                  AI Generated first
                </SelectItem>
                <SelectItem value={OrderBy.A_Z}>Terms A-Z</SelectItem>
                <SelectItem value={OrderBy.Z_A}>Terms Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center gap-1.5 ml-4">
            <Label htmlFor="search" className="mb-1">
              Search
            </Label>
            <Input
              name="search"
              placeholder="Enter term or translation"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Term</TableHead>
            {isNotRefLang && <TableHead>Ref translation</TableHead>}
            <TableHead>Translation</TableHead>
            {isNotRefLang && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderedTerms.map((term) => (
            <TableRow key={term.id}>
              <TableCell
                className="font-medium"
                width={isNotRefLang ? "20%" : "40%"}
              >
                {term.term}
              </TableCell>
              {isNotRefLang && (
                <TableCell width={"40%"}>
                  {
                    term.translations.find((tr) => tr.lang === project.refLang)
                      ?.translation
                  }
                </TableCell>
              )}
              <TableCell width={isNotRefLang ? "40%" : "60%"}>
                <TextareaAutosize
                  className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  defaultValue={
                    term.translations.find((tr) => tr.lang === choosedLang)
                      ?.translation
                  }
                  minRows={1}
                  onBlur={async (e) => {
                    await saveTranslation(
                      term,
                      choosedLang,
                      e.target.value,
                      userId
                    );
                    toast({
                      title: `Term "${term.term}" saved `,
                    });
                  }}
                />
                <div className="text-xs text-slate-400 mt-2 ml-2 flex items-center">
                  {term.translations.find((tr) => tr.lang === choosedLang)
                    ?.generatedByAI && (
                    <img
                      src="/ai.png"
                      alt="Generated by AI"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "6px",
                      }}
                    />
                  )}
                  {getRelativeTimeString(
                    term.translations.find((tr) => tr.lang === choosedLang)
                      ?.updatedAt
                  )}
                  {term.translations.find((tr) => tr.lang === choosedLang)
                    ? ", by "
                    : ""}
                  {term.translations.find((tr) => tr.lang === choosedLang)
                    ?.updatedBy?.email ??
                    (term.translations.find((tr) => tr.lang === choosedLang)
                      ? "Unknown"
                      : "")}
                </div>
              </TableCell>
              {isNotRefLang && (
                <>
                  <TableCell>
                    <Button
                      onClick={async () => {
                        await translate(
                          term,
                          choosedLang,
                          project.refLang,
                          userId
                        );
                        toast({
                          title: `Term "${term.term}" saved `,
                        });
                      }}
                    >
                      Translate
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
