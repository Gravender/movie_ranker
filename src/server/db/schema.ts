import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  date,
  timestamp,
  varchar,
  double,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `movie_ranker_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  movie_match: many(movie_match),
  user_movie_elo: many(user_movie_elo),
  genre_movie_user_elo: many(genre_movie_user_elo),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

export const movies = mysqlTable("movie", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  title: text("title"),
  budget: text("budget"),
  release_date: date("date"),
  poster_src: text("poster_src"),
});
export const moviesRelations = relations(movies, ({ many }) => ({
  movie_match: many(movie_match),
  user_movie_elo: many(user_movie_elo),
  movie_elo: many(movie_elo),
  moviesToGenre: many(moviesToGenre),
  genre_movie_elo: many(genre_movie_elo),
  genre_movie_user_elo: many(genre_movie_user_elo),
}));
export const genre = mysqlTable("genre", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: text("name").notNull(),
});
export const genreRelations = relations(genre, ({ many }) => ({
  moviesToGenres: many(moviesToGenre),
  genre_movie_elo: many(genre_movie_elo),
}));
export const moviesToGenre = mysqlTable("movies_to_genre", {
  movie_id: varchar("movie_id", { length: 255 }),
  genre_id: varchar("genre_id", { length: 255 }),
});
export const moviesToGenreRelations = relations(moviesToGenre, ({ one }) => ({
  movies: one(movies, {
    fields: [moviesToGenre.movie_id],
    references: [movies.id],
  }),
  genre: one(genre, {
    fields: [moviesToGenre.genre_id],
    references: [genre.id],
  }),
}));
export const movie_match = mysqlTable("movie_match", {
  user_id: varchar("user_id", { length: 255 }),
  movie_1_id: varchar("movie_1_id", { length: 255 }),
  movie_2_id: varchar("movie_2_id", { length: 255 }),
  result: int("int"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export const movie_matchRelations = relations(movie_match, ({ one }) => ({
  user: one(users, {
    fields: [movie_match.user_id],
    references: [users.id],
  }),
  movie_1: one(movies, {
    fields: [movie_match.movie_1_id],
    references: [movies.id],
  }),
  movie_2: one(movies, {
    fields: [movie_match.movie_2_id],
    references: [movies.id],
  }),
}));
export const user_movie_elo = mysqlTable("user_movie_elo", {
  user_id: varchar("user_id", { length: 255 }),
  movie_id: varchar("movie_id", { length: 255 }),
  elo: double("double"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export const user_movie_eloRelations = relations(user_movie_elo, ({ one }) => ({
  user: one(users, {
    fields: [user_movie_elo.user_id],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [user_movie_elo.movie_id],
    references: [movies.id],
  }),
}));
export const movie_elo = mysqlTable("movie_elo", {
  movie_id: varchar("movie_id", { length: 255 }),
  elo: double("double"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export const movie_eloRelations = relations(movie_elo, ({ one }) => ({
  movie: one(movies, {
    fields: [movie_elo.movie_id],
    references: [movies.id],
  }),
}));

export const genre_movie_elo = mysqlTable("genre_movie_elo", {
  genre_id: varchar("genre_id", { length: 255 }),
  movie_id: varchar("movie_id", { length: 255 }),
  elo: double("double"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const genre_movie_eloRelations = relations(
  genre_movie_elo,
  ({ one }) => ({
    genre: one(genre, {
      fields: [genre_movie_elo.genre_id],
      references: [genre.id],
    }),
    movie: one(movies, {
      fields: [genre_movie_elo.movie_id],
      references: [movies.id],
    }),
  }),
);

export const genre_movie_user_elo = mysqlTable("genre_movie_user_elo", {
  user_id: varchar("user_id", { length: 255 }),
  genre_id: varchar("genre_id", { length: 255 }),
  movie_id: varchar("movie_id", { length: 255 }),
  elo: double("double"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const genre_movie_user_eloRelations = relations(
  genre_movie_user_elo,
  ({ one }) => ({
    user: one(users, {
      fields: [genre_movie_user_elo.user_id],
      references: [users.id],
    }),
    genre: one(genre, {
      fields: [genre_movie_user_elo.genre_id],
      references: [genre.id],
    }),
    movie: one(movies, {
      fields: [genre_movie_user_elo.movie_id],
      references: [movies.id],
    }),
  }),
);
