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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiComboBox } from "@/components/ui/combobox";

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

export default function NotFound() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      budget: undefined,
      release_date: undefined,
      genre: [],
    },
  });

  // 2. Define a submit handler.
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(JSON.stringify(data, null, 2));
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="mt-8 w-1/3 rounded">
        <CardHeader>
          <CardTitle>Add Movie</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="The Titans" {...field} />
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
                        placeholder="18000000"
                        {...field}
                        value={field.value ? field.value : ""}
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
                name="genre"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <MultiComboBox
                        placeholder="genre's"
                        options={[
                          { value: "action", label: "Action" },
                          { value: "adventure", label: "Adventure" },
                        ]}
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
        </CardContent>
      </Card>
    </div>
  );
}
