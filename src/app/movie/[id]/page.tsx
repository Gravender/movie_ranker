import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

import { api } from "~/trpc/server";

export async function generateMetadata({ params }: Props) {
  const movie = await api.movie.getMovie.query({ id: params.id });
  if (!movie) return null;
  return {
    title: movie.title,
  };
}
export interface Props {
  params: { id: string };
}
export default async function NotFound({ params }: Props) {
  const movie = await api.movie.getMovie.query({ id: params.id });
  if (!movie) return null;
  console.log(movie);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="mt-4 h-[50rem] w-96">
        <CardHeader className="h-32">
          <CardTitle>{movie.title}</CardTitle>
          <CardDescription>
            {movie.release_date?.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <div className="relative h-[36rem] w-full">
          {movie.poster_src !== null && movie.poster_src !== "N/A" ? (
            <Image src={movie.poster_src} alt={movie.title ?? ""} fill />
          ) : null}
        </div>
        <CardFooter>
          <div className="w-full items-start">
            <span className="font-semibold">Genre:</span>
            {" " +
              movie.moviesToGenre.map((genre) => genre.genre?.name).join(", ")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
