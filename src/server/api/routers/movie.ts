import { z } from "zod";
import { env } from "~/env";

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
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${env.OMDBAPI_API_KEY}&t=${
          input.title
        }&y=${input?.releaseDate?.getFullYear()}`,
      );
      const movie_omdb = (await response.json()) as object;
      let poster = "";
      if (
        movie_omdb &&
        "Poster" in movie_omdb &&
        typeof movie_omdb.Poster === "string"
      ) {
        poster = movie_omdb.Poster;
      }
      await ctx.db.insert(movies).values({
        id: crypto.randomUUID(),
        title: input.title,
        release_date: input.releaseDate,
        poster_src: poster,
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
    .query(async ({ ctx, input }) => {
      return ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, input.id),
        with: {
          moviesToGenre: {
            with: {
              genre: true,
            },
          },
        },
      });
    }),
  updateMovieGenres: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        genres: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const movie = await ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, input.id),
      });
      console.log(input);
      if (!movie) return null;
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
          if (genre)
            await ctx.db.insert(moviesToGenre).values({
              genre_id: genre.id,
              movie_id: movie.id,
            });
        }),
      );
    }),
  getMovies: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.movies.findMany({
      orderBy: (movies, { desc }) => [desc(movies.release_date)],
      with: {
        moviesToGenre: {
          with: {
            genre: true,
          },
        },
      },
    });
  }),
  getMoviesGroupedGenre: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.genre.findMany({
      orderBy: (genre, { asc }) => [asc(genre.name)],
      with: {
        moviesToGenres: {
          limit: 20,
          with: {
            movies: {
              with: {
                moviesToGenre: {
                  with: {
                    genre: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }),
  getMoviesbyGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ ctx, input }) => {
      const movies = await ctx.db.query.movies.findMany({
        orderBy: (movies, { desc }) => [desc(movies.release_date)],
        with: {
          moviesToGenre: {
            with: {
              genre: true,
            },
          },
        },
      });
      return movies.filter((movie) => {
        return movie.moviesToGenre.find((g) => g.genre?.name === input.genre);
      });
    }),
  getGenres: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.genre.findMany({});
  }),
});
