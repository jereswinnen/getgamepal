import { addMonths, subMonths, format } from "date-fns";
import { DiscoverySection, GameResult } from "./types";

// Current date helpers
const now = new Date();
const threeMonthsFromNow = addMonths(now, 3);
const oneMonthAgo = subMonths(now, 1);
const oneYearAgo = subMonths(now, 12);
const oneMonthFromNow = addMonths(now, 1);

// Formatting dates for IGDB (Unix timestamp in seconds)
const unixNow = Math.floor(now.getTime() / 1000);
const unixThreeMonthsFromNow = Math.floor(threeMonthsFromNow.getTime() / 1000);
const unixOneMonthAgo = Math.floor(oneMonthAgo.getTime() / 1000);
const unixOneYearAgo = Math.floor(oneYearAgo.getTime() / 1000);
const unixOneMonthFromNow = Math.floor(oneMonthFromNow.getTime() / 1000);

// Common fields to fetch for all queries
const COMMON_FIELDS = `
  fields id, name, slug, summary, cover.url, first_release_date, 
  total_rating, total_rating_count, 
  platforms.name, platforms.slug, platforms.abbreviation, 
  genres.name, genres.slug,
  involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
`;

// Discovery sections configuration
export const discoverySections: DiscoverySection[] = [
  {
    id: "upcoming",
    name: "Upcoming Games",
    description: "Games releasing in the next 3 months",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where first_release_date >= ${unixNow} 
      & first_release_date <= ${unixThreeMonthsFromNow} 
      & status = 0;
      sort first_release_date asc;
      limit 20;
    `,
  },
  {
    id: "trending",
    name: "Trending Games",
    description: "Popular games from the last month",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where first_release_date >= ${unixOneMonthAgo} 
      & first_release_date <= ${unixNow} 
      & total_rating_count > 5;
      sort hypes desc;
      limit 20;
    `,
  },
  {
    id: "topRated",
    name: "Top Rated Games",
    description: "Highest-rated games released in the last year",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where first_release_date >= ${unixOneYearAgo} 
      & first_release_date <= ${unixNow} 
      & total_rating_count > 10 
      & total_rating > 80;
      sort total_rating desc;
      limit 20;
    `,
  },
  {
    id: "hidden-gems",
    name: "Hidden Gems",
    description: "Highly-rated games with lower popularity/recognition",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where total_rating > 80 
      & total_rating_count <= 50 
      & total_rating_count > 5 
      & first_release_date < ${unixNow} 
      & first_release_date > ${unixOneYearAgo};
      sort total_rating desc;
      limit 20;
    `,
  },
  {
    id: "classics",
    name: "Classic Games",
    description: "Influential games from previous generations",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where total_rating > 85 
      & total_rating_count > 100 
      & first_release_date < ${unixOneYearAgo};
      sort total_rating desc;
      limit 20;
    `,
    transform: (games: GameResult[]) => {
      // Filter to include only games with high ratings and older than 5 years
      const fiveYearsAgoTimestamp = Math.floor(
        subMonths(now, 60).getTime() / 1000
      );
      return games.filter(
        (game) =>
          game.first_release_date &&
          game.first_release_date < fiveYearsAgoTimestamp &&
          game.total_rating_count &&
          game.total_rating_count > 200
      );
    },
  },
  {
    id: "recent-releases",
    name: "Recent Releases",
    description: "Games released in the last 30 days",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where first_release_date >= ${unixOneMonthAgo} 
      & first_release_date <= ${unixNow};
      sort first_release_date desc;
      limit 20;
    `,
  },
];

// Utility to get a section by ID
export function getSectionById(id: string): DiscoverySection | undefined {
  return discoverySections.find((section) => section.id === id);
}

// Utility to get all section metadata (without queries)
export function getSectionsMeta() {
  return discoverySections.map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}
