import { cn } from "@/lib/utils";
import { auth, signOut } from "app/auth";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button className="ml-4" type="submit">
        Sign out
      </button>
    </form>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const items = [{ title: "Sázíme stromy", href: "/?domain=sazimestromy.cz" }];
  let session = await auth();
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <header className="bg-background sticky top-0 z-40 w-full border-b flex justify-center">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
              <div className="flex gap-6 md:gap-10">
                <div className="flex items-center space-x-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="inline-block font-bold">Translate-a-Tron 🤖</span>
                  </Link>
                  <nav className="flex gap-6 ml-8">
                    {/* {items?.map(
                      (item, index) =>
                        item.href && (
                          <Link
                            key={index}
                            href={item.href}
                            className={cn(
                              "flex items-center text-sm font-medium text-muted-foreground"
                            )}
                          >
                            {item.title}
                          </Link>
                        )
                    )} */}
                  </nav>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-4">
                You are logged in as {session?.user?.email}
                <SignOut />
              </div>
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
