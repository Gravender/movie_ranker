import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "~/trpc/server";
import { HighestEloMovies } from "../_components/highest-elo-movies";
import Link from "next/link";

export default async function Genres() {
  const genres = await api.movie.getMoviesGroupedGenreElo.query();
  if (genres.length === 0) return null;
  return (
    <div className="m-10 flex w-full justify-center">
      <div className="w-full max-w-7xl space-y-4 px-4">
        <div className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
          {genres
            .filter((genre) => genre.movies.length > 5)
            .map((genre) => {
              return (
                <Link
                  href={`/genre/${genre.id}`}
                  target="_blank"
                  rel="noreferrer"
                  key={genre.id}
                  className="col-span-1 lg:col-span-2"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{genre.name}</CardTitle>
                      <CardDescription>
                        {genre.movies.filter(
                          (movie) => movie.movie_elo !== undefined,
                        ).length + " Rated Movies"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HighestEloMovies movies={genre.movies.slice(0, 5)} />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
