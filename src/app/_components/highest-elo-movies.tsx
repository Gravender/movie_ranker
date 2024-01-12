import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import Image from "next/image";

type movie = {
  id: string;
  title: string | null;
  budget: string | null;
  release_date: Date | null;
  poster_src: string | null;
  movie_elo: number | undefined;
  moviesToGenre: {
    movie_id: string | null;
    genre_id: string | null;
    genre: {
      name: string;
      id: string;
    } | null;
  }[];
};
type HighestEloMoviesProps = {
  movies: movie[] | undefined;
};
export function HighestEloMovies({ movies }: HighestEloMoviesProps) {
  return (
    <div className="space-y-8">
      {movies
        ? movies.map((movie) => <MovieDisplay movie={movie} />)
        : Array(10).map((_) => (
            <div className="flex items-center">
              <div className="h-9 w-9">
                <Skeleton className="flex h-full w-full items-center justify-center rounded-sm bg-muted" />
              </div>
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="ml-auto h-4 w-[50px]" />
            </div>
          ))}
    </div>
  );
}
type MovieDisplayProps = {
  movie: movie;
};
const MovieDisplay = ({ movie }: MovieDisplayProps) => {
  return (
    <div className="flex items-center">
      <div className="h-9 w-9">
        {movie.poster_src && movie.poster_src !== "N/A" ? (
          <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted">
            <Image
              src={movie.poster_src}
              alt={movie.title ?? ""}
              width={36}
              height={36}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted" />
        )}
      </div>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{movie.title}</p>
        {movie.release_date && (
          <p className="text-sm text-muted-foreground">
            {format(movie.release_date, "LLL dd, y")}
          </p>
        )}
      </div>
      <div className="ml-auto font-medium">{movie.movie_elo}</div>
    </div>
  );
};
