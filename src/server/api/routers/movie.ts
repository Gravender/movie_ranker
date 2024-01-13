import { z } from "zod";
import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  movies,
  genre,
  moviesToGenre,
  movie_match,
  movie_elo,
  user_movie_elo,
  genre_movie_elo,
  genre_movie_user_elo,
} from "~/server/db/schema";
import { compareDesc } from "date-fns";
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
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
        where: (movies, { eq }) => eq(movies.title, input.title),
      });
      console.log(1);
      console.log(movie);
      console.log(input.title);
      console.log(input.releaseDate);
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
          movie_elo: {
            orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
            limit: 1,
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
  getMoviesByElo: publicProcedure.query(async ({ ctx }) => {
    const movies = await ctx.db.query.movies.findMany({
      orderBy: (movies, { desc }) => [desc(movies.release_date)],
      with: {
        moviesToGenre: {
          with: {
            genre: true,
          },
        },
        movie_elo: {
          orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
          limit: 1,
        },
      },
    });
    movies.sort((a, b) => {
      const a_elo = a.movie_elo[0]?.elo;
      const b_elo = b.movie_elo[0]?.elo;
      if (typeof a_elo === "number" && typeof b_elo === "number")
        return b_elo - a_elo;
      if (typeof a_elo === "number") return -1;
      if (typeof b_elo === "number") return 1;
      return a.movie_elo.length - b.movie_elo.length;
    });
    return movies.map((movie) => ({
      ...movie,
      movie_elo: movie.movie_elo[0]?.elo,
    }));
  }),
  getMoviesGroupedGenreElo: publicProcedure.query(async ({ ctx }) => {
    const genres = await ctx.db.query.genre.findMany({
      orderBy: (genre, { asc }) => [asc(genre.name)],
      with: {
        moviesToGenres: {
          with: {
            movies: {
              with: {
                moviesToGenre: {
                  with: {
                    genre: true,
                  },
                },
                genre_movie_elo: {
                  orderBy: (genre_movie_user_elo, { desc }) => [
                    desc(genre_movie_user_elo.createdAt),
                  ],
                },
              },
            },
          },
        },
      },
    });
    return genres.map((genre) => {
      const uniqueMovies = new Set();

      const movies = genre.moviesToGenres
        .filter((movie) => movie.movies !== null)
        .map((moviesToGenre) => {
          const movie = moviesToGenre.movies;
          const elo =
            movie.genre_movie_elo !== null && movie.genre_movie_elo.length > 0
              ? movie.genre_movie_elo.find(
                  (elo) => elo !== null && elo.genre_id === genre.id,
                )?.elo
              : undefined;
          const movieId = movie.id; // Get the movie ID

          // Check if the movie ID is already in the Set
          if (!uniqueMovies.has(movieId)) {
            // If not, add it to the Set and return the movie data
            uniqueMovies.add(movieId);
            return {
              id: movie.id,
              title: movie.title,
              release_date: movie.release_date,
              budget: movie.budget,
              poster_src: movie.poster_src,
              moviesToGenre: movie.moviesToGenre,
              movie_elo: elo,
            };
          }
          return null; // Return null for duplicate movies
        })
        .filter(notEmpty);
      movies.sort((a, b) => {
        if (typeof a.movie_elo === "number" && typeof b.movie_elo === "number")
          return b.movie_elo - a.movie_elo;
        if (typeof a.movie_elo === "number") return -1;
        if (typeof b.movie_elo === "number") return 1;
        if (a.release_date !== null && b.release_date !== null)
          return compareDesc(a.release_date, b.release_date);
        return a.moviesToGenre.length - b.moviesToGenre.length;
      });
      return {
        id: genre.id,
        name: genre.name,
        movies: movies,
      };
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
  getMoviesToCompare: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      let movies = await ctx.db.query.movies.findMany({
        with: {
          movie_1: {
            where: (movie_match, { eq }) => eq(movie_match.user_id, input.id),
          },
          movie_2: {
            where: (movie_match, { eq }) => eq(movie_match.user_id, input.id),
          },
          movie_elo: {
            orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
            limit: 1,
          },
        },
      });
      const matches = await ctx.db.query.movie_match.findMany({
        where: (movie_match, { eq }) => eq(movie_match.user_id, input.id),
      });
      movies = movies.sort((a, b) => {
        const a_matches = a.movie_1.length + a.movie_2.length;
        const a_skipped =
          a.movie_1.filter((match) => match.result === 0).length +
          a.movie_2.filter((match) => match.result === 0).length;
        const b_skipped =
          b.movie_1.filter((match) => match.result === 0).length +
          b.movie_2.filter((match) => match.result === 0).length;
        const avg_skipped = (a_skipped + b_skipped + 1) / 2;
        if (
          a_skipped !== b_skipped &&
          avg_skipped > (matches.length * 2 + movies.length / 2) / movies.length
        )
          return a_skipped - b_skipped;
        const b_matches = b.movie_1.length + b.movie_2.length;
        if (a_matches === b_matches) {
          const a_elo = a.movie_elo[0]?.elo;
          const b_elo = b.movie_elo[0]?.elo;
          if (typeof a_elo === "number" && typeof b_elo === "number")
            return Math.floor(b_elo / 15) * 15 - Math.floor(a_elo / 15) * 15;
          if (a.release_date !== null && b.release_date !== null) {
            const a_decade = a.release_date?.getFullYear();
            const b_decade = b.release_date?.getFullYear();
            return Math.floor(b_decade / 8) * 8 - Math.floor(a_decade / 8) * 8;
          }
        }
        return a_matches - b_matches;
      });
      const movie_match: {
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
      }[] = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < movies.length; index++) {
        const movie1 = movies[index];
        if (movie1 === undefined) break;
        if (
          movie_match.find(
            (match) =>
              match.movie_1.id === movie1.id || match.movie_2.id === movie1.id,
          ) !== undefined
        )
          continue;
        let movie2:
          | number
          | {
              id: string;
              title: string | null;
              budget: string | null;
              release_date: Date | null;
              poster_src: string | null;
              movie_1: {
                createdAt: Date;
                user_id: string | null;
                movie_1_id: string | null;
                movie_2_id: string | null;
                result: number | null;
              }[];
              movie_2: {
                createdAt: Date;
                user_id: string | null;
                movie_1_id: string | null;
                movie_2_id: string | null;
                result: number | null;
              }[];
            } = 1;
        let highest = 1;
        while (typeof movie2 === "number") {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < movies.length; i++) {
            const temp = movies[i];
            if (temp === undefined) continue;
            if (
              temp.id === movie1.id ||
              movie_match.findIndex(
                (match) =>
                  match.movie_1.id === movie1.id ||
                  match.movie_1.id === temp.id ||
                  match.movie_2.id === movie1.id ||
                  match.movie_2.id === temp.id,
              ) !== -1
            )
              continue;
            if (temp.movie_1.length === 0) {
              movie2 = temp;
              break;
            }
            const matches_movie_1 = temp.movie_1.reduce((count, current) => {
              if (
                current.movie_1_id === movie1.id ||
                current.movie_2_id === movie1.id
              )
                return count + 1;
              return count;
            }, 0);
            const matches = temp.movie_2.reduce((count, current) => {
              if (
                current.movie_1_id === movie1.id ||
                current.movie_2_id === movie1.id
              )
                return count + 1;
              return count;
            }, matches_movie_1);
            if (matches < movie2) {
              movie2 = temp;
              break;
            }
            if (matches > highest) highest = matches;
            if (highest > 1 && matches === highest && highest === movie2) {
              movie2 = temp;
              break;
            }
          }
          if (typeof movie2 === "number") movie2++;
          else {
            break;
          }
          if (movie2 > 30) break;
        }
        if (typeof movie2 === "number") continue;
        movie_match.push({
          movie_1: {
            id: movie1.id,
            title: movie1.title,
            release_date: movie1.release_date,
            poster_src: movie1.poster_src,
            budget: movie1.budget,
          },
          movie_2: {
            id: movie2.id,
            title: movie2.title,
            release_date: movie2.release_date,
            poster_src: movie2.poster_src,
            budget: movie2.budget,
          },
        });
        if (movie_match.length > 25) break;
      }
      return movie_match;
    }),
  rankMovie: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        movie_1: z.string(),
        movie_2: z.string(),
        score: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(movie_match).values({
        movie_1_id: input.movie_1,
        movie_2_id: input.movie_2,
        result: input.score,
        user_id: input.user_id,
      });
      if (input.score === 0) return null;
      const movie_1 = await ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, input.movie_1),
        with: {
          moviesToGenre: {
            with: {
              genre: {
                with: {
                  genre_movie_elo: {
                    where: (user_movie_elo, { eq }) =>
                      eq(user_movie_elo.movie_id, input.movie_1),
                    orderBy: (genre_movie_elo, { desc }) => [
                      desc(genre_movie_elo.createdAt),
                    ],
                    limit: 1,
                  },
                  genre_movie_user_elo: {
                    where: (user_movie_elo, { eq, and }) =>
                      and(
                        eq(user_movie_elo.movie_id, input.movie_1),
                        eq(user_movie_elo.user_id, input.user_id),
                      ),
                    orderBy: (genre_movie_elo, { desc }) => [
                      desc(genre_movie_elo.createdAt),
                    ],
                    limit: 1,
                  },
                },
              },
            },
          },
          movie_elo: {
            orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
            limit: 1,
          },
        },
      });
      const movie_2 = await ctx.db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, input.movie_2),
        with: {
          moviesToGenre: {
            with: {
              genre: {
                with: {
                  genre_movie_elo: {
                    where: (user_movie_elo, { eq }) =>
                      eq(user_movie_elo.movie_id, input.movie_1),
                    orderBy: (genre_movie_elo, { desc }) => [
                      desc(genre_movie_elo.createdAt),
                    ],
                    limit: 1,
                  },
                  genre_movie_user_elo: {
                    where: (user_movie_elo, { eq, and }) =>
                      and(
                        eq(user_movie_elo.movie_id, input.movie_2),
                        eq(user_movie_elo.user_id, input.user_id),
                      ),
                    orderBy: (genre_movie_elo, { desc }) => [
                      desc(genre_movie_elo.createdAt),
                    ],
                    limit: 1,
                  },
                },
              },
            },
          },
          movie_elo: {
            orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
            limit: 1,
          },
        },
      });
      const movie_1_user_elo =
        await ctx.db.query.genre_movie_user_elo.findFirst({
          where: (user_movie_elo, { eq, and }) =>
            and(
              eq(user_movie_elo.user_id, input.user_id),
              eq(user_movie_elo.movie_id, input.movie_1),
            ),
          orderBy: (user_movie_elo, { desc }) => [
            desc(user_movie_elo.createdAt),
          ],
        });
      const movie_2_user_elo =
        await ctx.db.query.genre_movie_user_elo.findFirst({
          where: (user_movie_elo, { eq, and }) =>
            and(
              eq(user_movie_elo.user_id, input.user_id),
              eq(user_movie_elo.movie_id, input.movie_2),
            ),
          orderBy: (user_movie_elo, { desc }) => [
            desc(user_movie_elo.createdAt),
          ],
        });
      if (movie_1 === undefined || movie_2 == undefined) return null;

      const probability = (rating1: number, rating2: number) =>
        (1.0 * 1.0) /
        (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400));
      const eloRating = (Ra: number, Rb: number, d: number) => {
        const k = 30;
        const Pb = probability(Ra, Rb);
        const Pa = probability(Rb, Ra);
        if (d == 1) {
          return {
            Ra: Math.round(Ra + k * (1 - Pa)),
            Rb: Math.round(Rb + k * (0 - Pb)),
          };
        }
        return {
          Ra: Math.round(Ra + k * (0 - Pa)),
          Rb: Math.round(Rb + k * (1 - Pb)),
        };
      };
      //calculate movie elo
      const movie_1_elo = movie_1?.movie_elo[0]?.elo ?? 1000;
      const movie_2_elo = movie_2?.movie_elo[0]?.elo ?? 1000;
      const new_movie_elo = eloRating(movie_1_elo, movie_2_elo, input.score);
      await ctx.db.insert(movie_elo).values({
        movie_id: movie_1.id,
        elo: new_movie_elo.Ra,
      });
      await ctx.db.insert(movie_elo).values({
        movie_id: movie_2.id,
        elo: new_movie_elo.Rb,
      });
      //calculate user movie elo
      const movie_1_user_movie_elo = movie_1_user_elo?.elo ?? 1000;
      const movie_2_user_movie_elo = movie_2_user_elo?.elo ?? 1000;
      const new_user_movie_elo = eloRating(
        movie_1_user_movie_elo,
        movie_2_user_movie_elo,
        input.score,
      );
      await ctx.db.insert(user_movie_elo).values({
        movie_id: movie_1.id,
        elo: new_user_movie_elo.Ra,
        user_id: input.user_id,
      });
      await ctx.db.insert(user_movie_elo).values({
        movie_id: movie_2.id,
        elo: new_user_movie_elo.Rb,
        user_id: input.user_id,
      });
      //calculate elo for genres
      const movie_2_genres = movie_1.moviesToGenre.map(
        (movieToGenre) => movieToGenre.genre.id,
      );
      const genres = movie_1.moviesToGenre
        .filter((moviesToGenre) =>
          movie_2_genres.includes(moviesToGenre.genre.id),
        )
        .filter(notEmpty)
        .map((genre) => ({
          id: genre.genre_id,
          movie_1: genre.genre,
          movie_2: movie_2.moviesToGenre.find(
            (movieToGenre) => movieToGenre.genre_id === genre.genre_id,
          )?.genre,
        }));
      genres.map(async (genre) => {
        //calculate genre movie elo
        const movie_1_genre_elo = genre.movie_1.genre_movie_elo[0]?.elo ?? 1000;
        const movie_2_genre_elo =
          genre.movie_2?.genre_movie_elo[0]?.elo ?? 1000;
        const new_genre_movie_elo = eloRating(
          movie_1_genre_elo,
          movie_2_genre_elo,
          input.score,
        );
        await ctx.db.insert(genre_movie_elo).values({
          movie_id: movie_1.id,
          elo: new_genre_movie_elo.Ra,
          genre_id: genre.id,
        });
        await ctx.db.insert(genre_movie_elo).values({
          movie_id: movie_2.id,
          elo: new_genre_movie_elo.Rb,
          genre_id: genre.id,
        });

        //calculate user movie elo
        const movie_1_genre_user_movie_elo =
          genre.movie_1.genre_movie_user_elo[0]?.elo ?? 1000;
        const movie_2_genre_user_movie_elo =
          genre.movie_2?.genre_movie_user_elo[0]?.elo ?? 1000;
        const new_genre_movie_user_elo = eloRating(
          movie_1_genre_user_movie_elo,
          movie_2_genre_user_movie_elo,
          input.score,
        );
        await ctx.db.insert(genre_movie_user_elo).values({
          movie_id: movie_1.id,
          elo: new_genre_movie_user_elo.Ra,
          user_id: input.user_id,
          genre_id: genre.id,
        });
        await ctx.db.insert(genre_movie_user_elo).values({
          movie_id: movie_2.id,
          elo: new_genre_movie_user_elo.Rb,
          user_id: input.user_id,
          genre_id: genre.id,
        });
      });
      console.log({
        movie1: movie_1.title + " Elo: " + new_movie_elo.Ra,
        movie2: movie_2.title + " Elo: " + new_movie_elo.Rb,
      });
      return new_movie_elo;
    }),
  test: protectedProcedure.query(async ({ ctx }) => {
    const movies = await ctx.db.query.movies.findMany({
      with: {
        movie_elo: {
          orderBy: (movie_elo, { desc }) => [desc(movie_elo.createdAt)],
        },
        movie_1: true,
        movie_2: true,
      },
    });
    movies.sort(
      (a, b) => (b.movie_elo[0]?.elo ?? 0) - (a.movie_elo[0]?.elo ?? 0),
    );
    return movies;
  }),
  movieStats: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const users = await ctx.db.query.users.findMany({
        with: {
          movie_match: true,
        },
      });
      let movies =
        input.user_id !== undefined
          ? await ctx.db.query.user_movie_elo.findMany({
              where: (user_movie_elo, { eq }) =>
                eq(user_movie_elo.user_id, input.user_id ?? ""),
              orderBy: (user_movie_elo, { desc }) => [
                desc(user_movie_elo.createdAt),
              ],
            })
          : 0;
      if (typeof movies !== "number") {
        const uniqueMovies = new Set();

        movies = movies
          .map((movie) => {
            const movieId = movie.id; // Get the movie ID
            // Check if the movie ID is already in the Set
            if (!uniqueMovies.has(movieId)) {
              // If not, add it to the Set and return the movie data
              uniqueMovies.add(movieId);
              return movie;
            }
            return null; // Return null for duplicate movies
          })
          .filter(notEmpty);
      }
      const ranking = users.map((user) => ({
        id: user.id,
        name: user.name,
        matches: user.movie_match.length,
      }));
      ranking.sort((a, b) => b.matches - a.matches);
      const totalMatches = users.reduce((total, curr) => {
        return total + curr.movie_match.length;
      }, 0);
      const userMatches =
        users.find((user) => user.id === input.user_id)?.movie_match?.length ??
        0;
      const averageMatches = totalMatches / users.length;
      const percentageDiff =
        (Math.abs(userMatches - averageMatches) /
          ((userMatches + averageMatches) / 2)) *
        100;
      return {
        matches: totalMatches,
        userMatches: {
          userMatches,
          percentageDiff:
            userMatches > averageMatches ? percentageDiff : percentageDiff * -1,
        },
        ranking: ranking,
        averageElo:
          typeof movies !== "number"
            ? movies.reduce((total, curr) => {
                return total + curr.elo;
              }, 0) / movies.length
            : 1000,
      };
    }),
});
