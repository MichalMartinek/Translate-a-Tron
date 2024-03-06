import { Button } from "@/components/ui/button";
import { and, count, eq } from "drizzle-orm";
import { db } from "../db";
import { TermWithTranslation, terms, translations } from "../schema";

async function getData(lang: string): Promise<TermWithTranslation[]> {
  console.log("Getting data");
  const res = await db
    .select()
    .from(terms)
    .leftJoin(
      translations,
      and(eq(terms.id, translations.termId), eq(translations.lang, lang))
    );

  return res;
}

export default async function ProtectedPage() {
  let translations = await getData("cs");
  console.log(translations);
  return (
    <div className="flex">
      <div className="w-screen h-screen flex flex-col space-y-5 justify-center items-center">
        <SignOut />
      </div>
    </div>
  );
}

function SignOut() {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        console.log(formData.get("term"));
        const term = (formData.get("term") as string) ?? "";
        const alreadyExists = await db
          .select({ value: count() })
          .from(terms)
          .where(eq(terms.term, term));
        console.log(alreadyExists);
        if (alreadyExists[0].value === 0) {
          await db.insert(terms).values({ term });
        }
      }}
    >
      <input name="term" placeholder="New Term" />

      <Button type="submit">Add</Button>
    </form>
  );
}
