import { auth } from "@/app/auth";
import { createUser, db, getUser } from "@/app/db";
import { Token, User, tokens, users } from "@/app/schema";
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
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

async function getTokenData(userId: number): Promise<Token[]> {
  const res = await db.query.tokens.findMany({
    where: and(eq(tokens.userId, userId), eq(tokens.expired, false)),
  });

  return res;
}

async function getUserData(): Promise<User[]> {
  const res = await db.query.users.findMany({});

  return res;
}

export default async function ProjectsPage() {
  let session = await auth();
  const userId = Number(session?.user?.id);

  const tokens = await getTokenData(userId);
  const users = await getUserData();
  return (
    <main className="pb-16">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <DeleteUser userId={user.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Separator className="my-4 mt-10" />
      <AddUser />
      <div className="flex justify-between items-end mb-8 mt-8">
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
      className="flex space-x-4 w-full max-w-sm items-end gap-1.5 ml-4"
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
        <Label htmlFor="name" className="ml-3">Token name</Label>
        <Input name="name" placeholder="Token name" />
      </div>
      <Button type="submit">Generate</Button>
    </form>
  );
}

function AddUser() {
  return (
    <form
      className="flex space-x-4 w-full max-w-sm items-end gap-1.5 ml-4"
      action={async (formData: FormData) => {
        "use server";
        let email = formData.get("email") as string;
        let password = formData.get("password") as string;
        let user = await getUser(email);

        if (user.length > 0) {
          return "User already exists"; // TODO: Handle errors with useFormStatus
        } else {
          await createUser(email, password);
        }
        // get current path and revalidate
        revalidatePath(`/translations/settings`);
      }}
    >
      <div className="grid items-center gap-1.5">
        <Label htmlFor="email" className="ml-3">Email</Label>
        <Input name="email" type="email" placeholder="Email" />
      </div>
      <div className="grid items-center gap-1.5">
        <Label htmlFor="password" className="ml-3">Password</Label>
        <Input name="password" type="password" placeholder="Password" />
      </div>
      <Button type="submit">Create</Button>
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
function DeleteUser({ userId }: { userId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        await db
          .delete(users)
          .where(eq(users.id, userId));
        revalidatePath(`/translations/settings`);
      }}
    >
      <Button type="submit">Delete</Button>
    </form>
  );
}
