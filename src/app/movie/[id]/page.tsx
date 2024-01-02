import {
  Card,
  CardContent,
  CardDescription,
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
      <Card className="mt-4 h-full">
        <CardHeader className="h-32">
          <CardTitle>{movie.title}</CardTitle>
          <CardDescription>
            {movie.release_date?.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          {movie.poster_src !== null ? (
            <Image src={movie.poster_src} alt={""} width={260} height={390} />
          ) : null}
          <div className="w-full items-start">
            <span className="font-semibold">Genre:</span>
            {" " +
              movie.moviesToGenre.map((genre) => genre.genre?.name).join(", ")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
