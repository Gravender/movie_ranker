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
import { Clapperboard } from "lucide-react";

export default async function Home() {
  const session = await getServerAuthSession();
  const movies = await api.movie.getMoviesByElo.query();
  const stats = await api.movie.movieStats.query({
    user_id: session ? session.user.id : undefined,
  });
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Movie Matches
              </CardTitle>
              <Clapperboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.matches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {stats.ranking.slice(0, 3).map((rank) => {
                return (
                  <div className="flex w-full justify-between">
                    <p className="text-sm font-semibold">{rank.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rank.matches}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Matches
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.userMatches.userMatches}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.userMatches.percentageDiff > 0
                  ? `+${stats.userMatches.percentageDiff.toFixed(
                      2,
                    )}% from average matches`
                  : `${stats.userMatches.percentageDiff.toFixed(
                      2,
                    )}% from average matches`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Average Elo
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageElo.toFixed() + " Elo"}
              </div>
            </CardContent>
          </Card>
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
