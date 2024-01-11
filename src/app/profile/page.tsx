import Link from "next/link";

import { getServerAuthSession } from "~/server/auth";

export default async function Profile() {
  const session = await getServerAuthSession();
  return (
    <div className="flex h-[800px] flex-col items-center justify-center lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {session && <span>Hello, {session.user?.name}</span>}
            </h1>
            <p className="text-sm text-muted-foreground">
              <span>
                {" "}
                {session ? "Logged in with discord" : "Log in with Discord"}
              </span>
            </p>
          </div>
          <div className="flex w-full items-center justify-center">
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="inline-flex h-10 w-2/3 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
