import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import { getServerAuthSession } from "@/src/server/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/server";
import { MovieCarousel } from "../_components/movie-carousel";

export default async function Home() {
  const session = await getServerAuthSession();
  const movies = await api.movie.getMoviesByElo.query({
    id: session?.user.id ?? "",
  });
  const genres = await api.movie.getMoviesGroupedGenreElo.query();
  return (
    <div className="mt-2 flex h-full w-full flex-col items-center justify-center gap-2">
      {movies ? <MovieCarousel movies={movies} title={"All Movies"} /> : null}
      {genres
        ? genres.map((genre) => {
            if (genre.movies.length > 5)
              return <MovieCarousel movies={genre.movies} title={genre.name} />;
            return null;
          })
        : null}
    </div>
  );
}

