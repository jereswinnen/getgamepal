import { addMonths, subMonths, format } from "date-fns";
import { DiscoverySection, GameResult } from "./types";

// Current date helpers
const now = new Date();
const threeMonthsFromNow = addMonths(now, 3);
const sixMonthsFromNow = addMonths(now, 6);
const oneYearFromNow = addMonths(now, 12);
const oneMonthAgo = subMonths(now, 1);
const oneYearAgo = subMonths(now, 12);
const twoYearsAgo = subMonths(now, 24);
const oneMonthFromNow = addMonths(now, 1);

// Formatting dates for IGDB (Unix timestamp in seconds)
const unixNow = Math.floor(now.getTime() / 1000);
const unixThreeMonthsFromNow = Math.floor(threeMonthsFromNow.getTime() / 1000);
const unixSixMonthsFromNow = Math.floor(sixMonthsFromNow.getTime() / 1000);
const unixOneYearFromNow = Math.floor(oneYearFromNow.getTime() / 1000);
const unixOneMonthAgo = Math.floor(oneMonthAgo.getTime() / 1000);
const unixOneYearAgo = Math.floor(oneYearAgo.getTime() / 1000);
const unixTwoYearsAgo = Math.floor(twoYearsAgo.getTime() / 1000);
const unixOneMonthFromNow = Math.floor(oneMonthFromNow.getTime() / 1000);

// Common fields to fetch for all queries
const COMMON_FIELDS = `
  fields id, name, slug, summary, cover.url, first_release_date, 
  total_rating, total_rating_count, hypes,
  platforms.name, platforms.slug, platforms.abbreviation, 
  genres.name, genres.slug,
  involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
`;

// Discovery sections configuration
export const discoverySections: DiscoverySection[] = [
  {
    id: "upcoming",
    name: "Upcoming Games",
    description: "Anticipated games coming in the next 6 months",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where (first_release_date >= ${unixNow} 
        & first_release_date <= ${unixSixMonthsFromNow}) 
        | (hypes > 5 & first_release_date >= ${unixNow} & first_release_date <= ${unixSixMonthsFromNow});
      sort hypes desc;
      limit 50;
    `,
    transform: (games: GameResult[]) => {
      // Ensure we have games with covers first, then sort by release date
      const withCovers = games.filter((game) => game.cover?.url);
      const withoutCovers = games.filter((game) => !game.cover?.url);

      // Sort by release date (more immediate releases first)
      const sortedWithCovers = withCovers.sort((a, b) => {
        // If one game has a release date and the other doesn't, the one with a date comes first
        if (a.first_release_date && !b.first_release_date) return -1;
        if (!a.first_release_date && b.first_release_date) return 1;
        // If both have dates, sort chronologically
        if (a.first_release_date && b.first_release_date) {
          return a.first_release_date - b.first_release_date;
        }
        // If neither has a date, leave as is (sorted by hype from API)
        return 0;
      });

      // Filter to ensure we only show games in next 6 months
      const upcomingSixMonths = sortedWithCovers.filter(
        (game) =>
          game.first_release_date &&
          game.first_release_date <= unixSixMonthsFromNow
      );

      // Take the top games with covers, then add some without if needed to reach 20 total
      const result = [...upcomingSixMonths];
      if (result.length < 20) {
        const remainingNeeded = 20 - result.length;
        // Only add games without covers if they're within the 6-month window
        const eligibleWithoutCovers = withoutCovers.filter(
          (game) =>
            game.first_release_date &&
            game.first_release_date <= unixSixMonthsFromNow
        );
        result.push(...eligibleWithoutCovers.slice(0, remainingNeeded));
      } else {
        return result.slice(0, 20);
      }

      return result;
    },
  },
  {
    id: "trending",
    name: "Trending Games",
    description: "Popular games from the last month",
    endpoint: "games",
    query: `
      ${COMMON_FIELDS}
      where first_release_date >= ${unixTwoYearsAgo} 
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
