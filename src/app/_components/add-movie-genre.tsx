"use client";
import { Button } from "ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "ui/form";
import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MultiComboBox } from "@/components/ui/combobox";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const formSchema = z.object({
  genre: z.array(z.string(), {
    required_error: "Please select a genre.",
  }),
});

type AddMovieGenreProps = {
  id: string;
  genres: { value: string; label: string }[];
};

export const AddMovieGenre = ({ id, genres }: AddMovieGenreProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: [],
    },
  });
  const updateMovieGenre = api.movie.updateMovieGenres.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  // 2. Define a submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    updateMovieGenre.mutate({
      id,
      genres: data.genre,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <MultiComboBox
                  placeholder="genre's"
                  options={genres}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};
