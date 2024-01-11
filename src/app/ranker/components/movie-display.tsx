import { Card, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";

type movieProps = {
  selected: boolean;
  movie: {
    id: string;
    title: string | null;
    budget: string | null;
    release_date: Date | null;
    poster_src: string | null;
  };
};

export default function MovieDisplay({ movie, selected }: movieProps) {
  const MovieBody = () => {
    return (
      <>
        <div className="relative h-4/5 w-full">
          {movie.poster_src !== null && movie.poster_src !== "N/A" ? (
            <Image src={movie.poster_src} alt={movie.title ?? ""} fill />
          ) : null}
        </div>
        <CardFooter>
          <div className="flex flex-grow flex-col items-start">
            <h2 className="pt-1 text-left font-medium">{movie.title}</h2>
            {movie.release_date ? (
              <span className="flex items-center ">
                {format(movie.release_date, "LLL dd, y")}
              </span>
            ) : null}
          </div>
        </CardFooter>
      </>
    );
  };
  if (selected) {
    return (
      <Card className="h-[30rem] w-80 border-2 border-primary">
        <MovieBody />
      </Card>
    );
  }
  return (
    <Card className="h-[30rem] w-80">
      <MovieBody />
    </Card>
  );
}
