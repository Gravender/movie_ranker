import { api } from "~/trpc/server";
import { getServerAuthSession } from "@/src/server/auth";
import { RankMovie } from "./components/rank-movie";

export async function generateMetadata() {
  return {
    title: "Movie Ranker",
  };
}

export default async function NotFound() {
  const session = await getServerAuthSession();
  if (!session) return null;
  const matches = await api.movie.getMoviesToCompare.query({
    id: session.user.id,
  });

  return (
    <div className="flex h-full w-full items-center justify-center gap-4 pt-4">
      {matches.length > 0 && (
        <RankMovie matches={matches} user_id={session.user.id} />
      )}
    </div>
  );
}
