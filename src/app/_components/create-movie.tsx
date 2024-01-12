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
import { Input } from "ui/input";
import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DateInput } from "@/components/ui/date-input";
import { MultiComboBox } from "@/components/ui/combobox";
import { api } from "~/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const formSchema = z.object({
  title: z.string().min(2),
  budget: z.string().optional(),
  release_date: z.date({
    required_error: "A release date is required.",
  }),
  genre: z.array(z.string(), {
    required_error: "Please select a genre.",
  }),
});

type CreateMovieProps = {
  genres: { value: string; label: string }[];
};

export const CreateMovie = ({ genres }: CreateMovieProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      budget: undefined,
      release_date: undefined,
      genre: [],
    },
  });
  const createMovie = api.movie.create.useMutation({
    onSuccess: (movie) => {
      if (movie === null) {
        toast({
          title: "Failed",
          description: "Movie already in database",
        });
      } else {
        toast({
          title: movie.title ?? "Movie",
          description:
            "Added successfully with" + movie?.poster_src !== null
              ? "poster added"
              : "",
          action: (
            <ToastAction altText="Add Another" onClick={() => form.reset()}>
              Add Another
            </ToastAction>
          ),
        });
      }
    },
  });

  // 2. Define a submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    createMovie.mutate({
      title: data.title,
      genres: data.genre,
      releaseDate: data.release_date,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a movie title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="release_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Release Date</FormLabel>
              <FormControl>
                <DateInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movie Budget</FormLabel>
              <FormControl>
                <Input
                  type="string"
                  placeholder="Enter movie budget"
                  {...field}
                  value={field.value ? field.value : ""}
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
