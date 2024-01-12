export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Movie Ranker",
  description: "Ranking movies using a elo based system.",
  mainNav: [
    {
      title: "Movies",
      href: "/movies",
    },
    {
      title: "Ranker",
      href: "/ranker",
    },
  ],
  links: {
    github: "https://github.com/gravender",
  },
};
