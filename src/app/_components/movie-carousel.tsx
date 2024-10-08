"use client"

import { CardTitle, Card, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  export function MovieCarousel({ movies, title }: movieCarouselProps){
    const router = useRouter();
    return (
      <div className="flex w-full max-w-7xl flex-col items-center justify-center">
        <CardTitle className="w-full pl-12 text-left">{`${title}:`}</CardTitle>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="mt-4 w-4/6 max-w-xs sm:w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
        >
          <CarouselContent>
            {movies.map((movie) => (
              <CarouselItem
                key={title + movie.id}
                className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
              >
                <Card
                  className="h-96 w-full rounded-xl"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <div className="relative h-4/5 w-full">
                    {movie.poster_src !== null && movie.poster_src !== "N/A" ? (
                      <Image
                      className="rounded-t-xl"
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