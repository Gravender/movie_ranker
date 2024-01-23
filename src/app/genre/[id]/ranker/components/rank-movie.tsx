"use client";
import { Button } from "ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "ui/form";
import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import MovieDisplay from "./movie-display";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  selected: z.string(),
});

type RankMovieProps = {
  matches: {
    movie_1: {
      id: string;
      title: string | null;
      budget: string | null;
      release_date: Date | null;
      poster_src: string | null;
    };
    movie_2: {
      id: string;
      title: string | null;
      budget: string | null;
      release_date: Date | null;
      poster_src: string | null;
    };
  }[];
  user_id: string;
  genre: { id: string; name: string };
};

export const RankMovie = ({ matches, user_id, genre }: RankMovieProps) => {
  const [index, setIndex] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();
  const insertMatch = api.movie.rankGenreMovie.useMutation({
    onSuccess: async (result) => {
      if (result === null) {
        toast({
          title: "Match Skipped",
        });
      } else {
        toast({
          title: "Successfully ranked",
        });
      }
      if (index === matches.length - 1) {
        await resetRank();
      } else {
        form.reset();
        setIndex(index + 1);
      }
    },
  });
  const resetRank = async () => {
    form.reset();
    await utils.movie.getMoviesToCompare.invalidate({
      id: user_id,
    });
    router.refresh();
    setIndex(0);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selected: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    const movie_1 = matches[index]!.movie_1.id;
    const movie_2 = matches[index]!.movie_2.id;
    insertMatch.mutate({
      movie_1,
      movie_2,
      user_id,
      genre_id: genre.id,
      score: data.selected === movie_1 ? 1 : data.selected === movie_2 ? 2 : 0,
    });
  }

  return (
    <div className="flex h-full w-full items-center justify-center gap-4 pt-4">
      {matches[index] !== undefined ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="selected"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-lg">
                    {`Rank Movie Based on `}{" "}
                    <em className="font-bold">{genre.name}</em>
                    {" Genre"}
                  </FormLabel>
                  <FormDescription>
                    Select Which Movie you prefer.
                  </FormDescription>
                  <FormControl>
                    <div className="flex h-full w-full items-center justify-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(matches[index]?.movie_1.id)
                        }
                      >
                        <MovieDisplay
                          selected={matches[index]?.movie_1.id === field.value}
                          movie={matches[index]!.movie_1}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(matches[index]?.movie_2.id)
                        }
                      >
                        <MovieDisplay
                          selected={matches[index]?.movie_2.id === field.value}
                          movie={matches[index]!.movie_2}
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-center gap-6">
              <Button
                disabled={
                  insertMatch.isLoading ||
                  !(
                    form.getValues().selected === matches[index]?.movie_1.id ||
                    form.getValues().selected === matches[index]?.movie_2.id
                  )
                }
                variant="secondary"
                type="submit"
              >
                Rank
              </Button>
              <Button
                variant="secondary"
                type="button"
                disabled={insertMatch.isLoading}
                onClick={() => {
                  insertMatch.mutate({
                    movie_1: matches[index]!.movie_1.id,
                    movie_2: matches[index]!.movie_2.id,
                    user_id,
                    genre_id: genre.id,
                    score: 0,
                  });
                }}
              >
                skip
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
};
