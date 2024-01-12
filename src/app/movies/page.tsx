"use client";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export default function Home() {
  const { data: movies } = api.movie.getMoviesByElo.useQuery();
  const { data: genres } = api.movie.getMoviesGroupedGenreElo.useQuery();
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
type movieCarouselProps = {
  movies: {
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
  }[];
  title: string;
};
const MovieCarousel = ({ movies, title }: movieCarouselProps) => {
  const router = useRouter();
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <CardTitle className="w-full pl-12 text-left">{`${title}:`}</CardTitle>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="mt-4 w-full lg:max-w-5xl 2xl:max-w-7xl"
      >
        <CarouselContent>
          {movies.map((movie) => (
            <CarouselItem
              key={title + movie.id}
              className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
            >
              <Card
                className="h-96 w-full"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <div className="relative h-4/5 w-full">
                  {movie.poster_src !== null && movie.poster_src !== "N/A" ? (
                    <Image
                      src={movie.poster_src}
                      alt={movie.title ?? ""}
                      fill
                    />
                  ) : null}
                </div>
                <CardFooter className="px-2">
                  <div className="flex w-full flex-grow flex-col items-start">
                    <h3 className="text-small flex w-full truncate pt-1 text-left font-medium">
                      {movie.title}
                    </h3>
                    {movie.movie_elo !== undefined && (
                      <span className="text-sm">
                        {" Elo: " + movie.movie_elo}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
