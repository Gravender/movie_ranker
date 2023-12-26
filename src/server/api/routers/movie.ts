import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { movies, genre, moviesToGenre } from "~/server/db/schema";

export const movieRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        releaseDate: z.date(),
        genres: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let movie = await ctx.db.query.movies.findFirst({
        where: (movies, { eq }) =>
          eq(movies.title, input.title) &&
          eq(movies.release_date, input.releaseDate),
      });
      if (movie) return null;
      await ctx.db.insert(movies).values({
        id: crypto.randomUUID(),
        title: input.title,
        release_date: input.releaseDate,
      });
      movie = await ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.title, input.title),
      });
      if (movie === undefined) return null;
      const genres = await Promise.all(
        input.genres.map(async (genre_name) => {
          const returnedGenre = await ctx.db.query.genre.findFirst({
            where: (genre, { eq }) => eq(genre.name, genre_name),
          });
          if (returnedGenre === undefined) {
            await ctx.db.insert(genre).values({
              id: crypto.randomUUID(),
              name: genre_name,
            });
            const returnedGenre = await ctx.db.query.genre.findFirst({
              where: (genre, { eq }) => eq(genre.name, genre_name),
            });
            return returnedGenre;
          }
          return returnedGenre;
        }),
      );

      await Promise.all(
        genres.map(async (genre) => {
          if (genre && movie)
            await ctx.db.insert(moviesToGenre).values({
              genre_id: genre.id,
              movie_id: movie.id,
            });
        }),
      );
      return movie;
    }),

  getMovie: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, input.id),
        with: {
          moviesToGenre: true,
        },
      });
    }),
  getMovies: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.movies.findMany({
      orderBy: (movies, { desc }) => [desc(movies.release_date)],
    });
  }),
});
