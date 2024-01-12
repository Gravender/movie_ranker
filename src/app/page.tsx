import { api } from "~/trpc/server";
import { getServerAuthSession } from "@/src/server/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "./_components/overview";
import { HighestEloMovies } from "./_components/highest-elo-movies";
import Link from "next/link";

export default async function Home() {
  const session = await getServerAuthSession();
  const movies = await api.movie.getMoviesByElo.query();
  const eloData = movies
    .map((movie) => movie?.movie_elo ?? 0)
    .filter((elo) => elo !== 0);
  return (
    <div className="m-10 flex w-full justify-center">
      <div className="w-full max-w-7xl space-y-4 px-4">
        <div className="flex h-24 flex-col items-center justify-center lg:px-0">
          <div className="">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                {session ? (
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome, {session.user.name}
                  </h1>
                ) : (
                  <div className="flex w-full flex-col items-center justify-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Login to start ranking movies
                    </h1>
                    <Link
                      href={session ? "/api/auth/signout" : "/api/auth/signin"}
                      className="inline-flex h-10 w-2/3 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {session ? "Sign out" : "Sign in"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Elo Normal Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview data={eloData} />
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Highest Rated Movies</CardTitle>
              <CardDescription>
                {movies.filter((movie) => movie.movie_elo !== undefined)
                  .length + " Rated Movies"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HighestEloMovies movies={movies.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
