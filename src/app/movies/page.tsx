"use client";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { compareDesc, format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export default function NotFound() {
  const { data: movies } = api.movie.getMovies.useQuery();
  const { data: genres } = api.movie.getMoviesGroupedGenre.useQuery();
  return (
    <div className="mt-2 flex h-full w-full flex-col items-center justify-center gap-2">
      {movies ? <MovieCarousel movies={movies} title={"All Movies"} /> : null}
      {genres
        ? genres.map((genre) => {
            const genre_movies = genre.moviesToGenres.flatMap(
              (moviesToGenre) => {
                if (moviesToGenre.movies) {
                  return [moviesToGenre.movies];
                }
                return [];
              },
            );
            if (genre_movies.length >= 5)
              return (
                <MovieCarousel
                  movies={genre_movies.sort((a, b) => {
                    if (a.release_date !== null && b.release_date !== null)
                      return compareDesc(a.release_date, b.release_date);
                    return a.moviesToGenre.length - b.moviesToGenre.length;
                  })}
                  title={genre.name}
                />
              );
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
              key={movie.id}
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
                <CardFooter>
                  <div className="flex flex-grow flex-col items-start">
                    <h2 className="pt-1 text-left font-medium">
                      {movie.title}
                    </h2>
                    {movie.release_date ? (
                      <span className="flex items-center ">
                        {format(movie.release_date, "LLL dd, y")}
                      </span>
                    ) : null}
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
