// stadiums.ts — 16 official FIFA World Cup 2026 venues

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Mexico" | "Canada";
  capacity: number;
  description: string;
  surface: string;
}

export const STADIUMS: Stadium[] = [
  // ── USA (11) ──────────────────────────────────────────────────────────────
  {
    id: "metlife",
    name: "MetLife Stadium",
    city: "East Rutherford",
    country: "USA",
    capacity: 82_500,
    description: "The largest stadium in the 2026 tournament. Home to the World Cup Final, rising from the New Jersey meadowlands with a capacity that will make it the loudest venue in North America.",
    surface: "Natural Grass"
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    capacity: 70_000,
    description: "Hollywood's stadium. The futuristic translucent roof creates a cathedral of light above Los Angeles.",
    surface: "Natural Grass"
  },
  {
    id: "att",
    name: "AT&T Stadium",
    city: "Dallas",
    country: "USA",
    capacity: 80_000,
    description: "The world's largest domed stadium. Known as Jerry's World — a monument to excess and spectacle in the heart of Texas.",
    surface: "Natural Grass"
  },
  {
    id: "nrg",
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    capacity: 72_000,
    description: "Houston's retractable-roof colossus, built for extremes of weather and atmosphere.",
    surface: "Natural Grass"
  },
  {
    id: "hard-rock",
    name: "Hard Rock Stadium",
    city: "Miami",
    country: "USA",
    capacity: 65_000,
    description: "Miami's sunbaked open-air arena, where South American passion will find familiar heat.",
    surface: "Natural Grass"
  },
  {
    id: "lumen",
    name: "Lumen Field",
    city: "Seattle",
    country: "USA",
    capacity: 69_000,
    description: "Seattle's fortress in the Pacific Northwest. Famous for crowd noise that disrupts radio communications.",
    surface: "Natural Grass"
  },
  {
    id: "arrowhead",
    name: "GEHA Field at Arrowhead",
    city: "Kansas City",
    country: "USA",
    capacity: 76_000,
    description: "Consistently voted the loudest stadium in the NFL. A cauldron in Kansas City.",
    surface: "Natural Grass"
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 71_000,
    description: "Atlanta's architectural marvel — a retractable roof shaped like a falcon's wings.",
    surface: "Natural Grass"
  },
  {
    id: "lincoln",
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    country: "USA",
    capacity: 69_000,
    description: "Philadelphia's iconic stadium, where the city's fierce sporting identity runs deepest.",
    surface: "Natural Grass"
  },
  {
    id: "gillette",
    name: "Gillette Stadium",
    city: "Foxborough",
    country: "USA",
    capacity: 65_000,
    description: "New England's cathedral, home to the most successful dynasty in American sports history.",
    surface: "Natural Grass"
  },
  {
    id: "boa",
    name: "Bank of America Stadium",
    city: "Charlotte",
    country: "USA",
    capacity: 75_000,
    description: "Charlotte's stadium, compact and loud, punching above its weight.",
    surface: "Natural Grass"
  },

  // ── Mexico (3) ────────────────────────────────────────────────────────────
  {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87_000,
    description: "The most iconic stadium in World Cup history. Scene of Maradona's Hand of God and Goal of the Century. This is where football mythology lives.",
    surface: "Natural Grass"
  },
  {
    id: "akron",
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "Mexico",
    capacity: 49_850,
    description: "Guadalajara's modern arena, nestled in the Bosque de la Primavera nature reserve.",
    surface: "Natural Grass"
  },
  {
    id: "bbva",
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "Mexico",
    capacity: 53_500,
    description: "Monterrey's mountain-ringed stadium, the Cerro de la Silla as backdrop for every match.",
    surface: "Natural Grass"
  },

  // ── Canada (2) ────────────────────────────────────────────────────────────
  {
    id: "bc-place",
    name: "BC Place",
    city: "Vancouver",
    country: "Canada",
    capacity: 54_500,
    description: "Vancouver's domed stadium where the Pacific Northwest meets the world.",
    surface: "Artificial Turf"
  },
  {
    id: "bmo",
    name: "BMO Field",
    city: "Toronto",
    country: "Canada",
    capacity: 45_500,
    description: "Toronto's compact, electric stadium — Canada's home of football in their defining World Cup moment.",
    surface: "Natural Grass"
  }
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
