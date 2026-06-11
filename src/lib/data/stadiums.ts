// stadiums.ts — 16 official FIFA World Cup 2026 venues

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Mexico" | "Canada";
  capacity: number;
}

export const STADIUMS: Stadium[] = [
  // ── USA (11) ──────────────────────────────────────────────────────────────
  {
    id: "metlife",
    name: "MetLife Stadium",
    city: "East Rutherford",
    country: "USA",
    capacity: 82_500,
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    capacity: 70_000,
  },
  {
    id: "att",
    name: "AT&T Stadium",
    city: "Dallas",
    country: "USA",
    capacity: 80_000,
  },
  {
    id: "nrg",
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    capacity: 72_000,
  },
  {
    id: "hard-rock",
    name: "Hard Rock Stadium",
    city: "Miami",
    country: "USA",
    capacity: 65_000,
  },
  {
    id: "lumen",
    name: "Lumen Field",
    city: "Seattle",
    country: "USA",
    capacity: 69_000,
  },
  {
    id: "arrowhead",
    name: "GEHA Field at Arrowhead",
    city: "Kansas City",
    country: "USA",
    capacity: 76_000,
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 71_000,
  },
  {
    id: "lincoln",
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    country: "USA",
    capacity: 69_000,
  },
  {
    id: "gillette",
    name: "Gillette Stadium",
    city: "Foxborough",
    country: "USA",
    capacity: 65_000,
  },
  {
    id: "boa",
    name: "Bank of America Stadium",
    city: "Charlotte",
    country: "USA",
    capacity: 75_000,
  },

  // ── Mexico (3) ────────────────────────────────────────────────────────────
  {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87_000,
  },
  {
    id: "akron",
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "Mexico",
    capacity: 49_850,
  },
  {
    id: "bbva",
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "Mexico",
    capacity: 53_500,
  },

  // ── Canada (2) ────────────────────────────────────────────────────────────
  {
    id: "bc-place",
    name: "BC Place",
    city: "Vancouver",
    country: "Canada",
    capacity: 54_500,
  },
  {
    id: "bmo",
    name: "BMO Field",
    city: "Toronto",
    country: "Canada",
    capacity: 45_500,
  },
];

// ─── Derived lookups ─────────────────────────────────────────────────────────

/** Total number of venues — must be 16 */
export const VENUE_COUNT = STADIUMS.length;

/** Record keyed by stadium id for O(1) lookups */
export const STADIUMS_MAP: Record<string, Stadium> = Object.fromEntries(
  STADIUMS.map((s) => [s.id, s]),
);

/** Safe lookup — returns undefined for unknown ids */
export function getStadium(id: string): Stadium | undefined {
  return STADIUMS_MAP[id];
}

// ─── Build-time assertion ────────────────────────────────────────────────────
if (VENUE_COUNT !== 16) {
  throw new Error(
    `stadiums.ts: expected 16 venues but found ${VENUE_COUNT}. Fix the list!`,
  );
}
