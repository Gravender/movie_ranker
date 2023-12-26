import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "~/trpc/server";
import { CreateMovie } from "../../_components/create-movie";

export default async function NotFound() {
  const genres = await api.movie.getGenres.query();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="mt-8 w-1/3 rounded">
        <CardHeader>
          <CardTitle>Add Movie</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMovie
            genres={genres.map((genre) => ({
              value: genre.name,
              label: genre.name,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
