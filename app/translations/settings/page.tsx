import { auth } from "@/app/auth";
import { db } from "@/app/db";
import { Token, terms, tokens } from "@/app/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { saveTranslation } from "../[project]/actions";

async function getData(userId: number): Promise<Token[]> {
  const res = await db.query.tokens.findMany({
    where: and(eq(tokens.userId, userId), eq(tokens.expired, false)),
  });

  return res;
}

export default async function ProjectsPage() {
  let session = await auth();
  console.log(session?.user);
  const userId = Number(session?.user?.id);

  const tokens = await getData(userId);
  return (
    <main className=" ">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tokens</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell className="font-medium">{token.name}</TableCell>
              <TableCell>
                <code>{token.key}</code>
              </TableCell>
              <TableCell>
                <ExpireToken tokenId={token.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Separator className="my-4 mt-10" />
      <AddToken userId={userId} />
    </main>
  );
}

function AddToken({ userId }: { userId: number }) {
  return (
    <form
      className="flex space-x-4 w-full max-w-sm items-end gap-1.5"
      action={async (formData: FormData) => {
        "use server";
        const name = (formData.get("name") as string) ?? "";
        const key = uuidv4();
        await db.insert(tokens).values({ userId, key, expired: false, name });
        // get current path and revalidate
        revalidatePath(`/translations/settings`);
      }}
    >
      <div className="grid items-center gap-1.5">
        <Label htmlFor="name">Token name</Label>
        <Input name="name" placeholder="Token name" />
      </div>
      <Button type="submit">Generate</Button>
    </form>
  );
}
function ExpireToken({ tokenId }: { tokenId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        await db
          .update(tokens)
          .set({ expired: true })
          .where(eq(tokens.id, tokenId));
        // get current path and revalidate
        revalidatePath(`/translations/settings`);
      }}
    >
      <Button type="submit">Expire</Button>
    </form>
  );
}
