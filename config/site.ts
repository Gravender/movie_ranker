export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Movie Ranker",
  description: "Ranking movies using a elo based system.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Movies",
      href: "/movies",
    },
  ],
  links: {
    github: "https://github.com/gravender",
  },
};
