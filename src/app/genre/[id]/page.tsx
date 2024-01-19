import { api } from "~/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "../../_components/overview";
import { HighestEloMovies } from "../../_components/highest-elo-movies";

export async function generateMetadata({ params }: Props) {
  const genre = await api.movie.getGenre.query({ id: params.id });
  if (!genre) return null;
  return {
    title: genre.name,
  };
}
export interface Props {
  params: { id: string };
}

export default async function Genre({ params }: Props) {
  const movies = await api.movie.getGenreMoviesByElo.query({ id: params.id });
  const eloData = movies
    .map((movie) => movie?.movie_elo ?? 0)
    .filter((elo) => elo !== 0);
  return (
    <div className="m-10 flex w-full justify-center">
      <div className="w-full max-w-7xl space-y-4 px-4">
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
