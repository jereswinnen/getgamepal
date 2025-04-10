export const GAME_STATUS_OPTIONS = [
  "Wishlisted",
  "Not Started",
  "Playing",
  "Revisit",
  "Abandoned",
  "Finished",
  "Finished 100%",
] as const;

export const OWNERSHIP_TYPE_OPTIONS = [
  "Physical",
  "Physical with Case",
  "Digital",
  "Subscription",
  "Not Owned",
] as const;

export type GameStatus = (typeof GAME_STATUS_OPTIONS)[number];
export type OwnershipType = (typeof OWNERSHIP_TYPE_OPTIONS)[number];
