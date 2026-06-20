// stadiums.ts — 16 official FIFA World Cup 2026 venues

export interface Stadium {
  id: string;
  /** Commercial / everyday name */
  name: string;
  /** FIFA tournament name (sponsor-stripped) used during the World Cup */
  officialName: string;
  city: string;
  country: "USA" | "Mexico" | "Canada";
  capacity: number;
  /** Year the venue opened */
  opened: number;
  /** Roof type — "Open Air" | "Retractable Roof" | "Translucent Canopy" … */
  roof: string;
  surface: string;
  /** Resident clubs / franchises */
  tenants: string;
  /** Headline tag — a knockout role or an atmospheric superlative */
  distinction: string;
  /** Signature accent colour for theming the detail view */
  accent: string;
  /** Notable altitude, where it matters */
  elevation?: string;
  /** A single "did you know" line */
  funFact: string;
  description: string;
  /** match.city / match.stadium values played here (for fixture lookup) */
  matchCities: string[];
}

export const STADIUMS: Stadium[] = [
  // ── USA (11) ──────────────────────────────────────────────────────────────
  {
    id: "metlife",
    name: "MetLife Stadium",
    officialName: "New York New Jersey Stadium",
    city: "East Rutherford",
    country: "USA",
    capacity: 82_500,
    opened: 2010,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "New York Giants & Jets (NFL)",
    distinction: "World Cup Final",
    accent: "#3D6FE0",
    funFact:
      "Will crown the world champions on 19 July 2026 — the first men's World Cup Final ever held in the New York area.",
    description:
      "The largest stadium in the 2026 tournament. Home to the World Cup Final, rising from the New Jersey meadowlands with a capacity that will make it the loudest venue in North America.",
    matchCities: ["New York/New Jersey", "East Rutherford"],
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    officialName: "Los Angeles Stadium",
    city: "Los Angeles",
    country: "USA",
    capacity: 70_000,
    opened: 2020,
    roof: "Translucent Canopy",
    surface: "Natural Grass",
    tenants: "LA Rams & Chargers (NFL)",
    distinction: "Hollywood's Arena",
    accent: "#C9A24B",
    funFact:
      "Its 70,000 seats can expand toward 100,000, and the translucent ETFE canopy is visible from planes landing at LAX.",
    description:
      "Hollywood's stadium. The futuristic translucent roof creates a cathedral of light above Los Angeles.",
    matchCities: ["Los Angeles", "Inglewood"],
  },
  {
    id: "att",
    name: "AT&T Stadium",
    officialName: "Dallas Stadium",
    city: "Dallas",
    country: "USA",
    capacity: 80_000,
    opened: 2009,
    roof: "Retractable Roof",
    surface: "Natural Grass",
    tenants: "Dallas Cowboys (NFL)",
    distinction: "Most Matches — 9",
    accent: "#8AA6D6",
    funFact:
      "Hosts more matches than any other 2026 venue — nine in total, including a semi-final.",
    description:
      "The world's largest domed stadium. Known as Jerry's World — a monument to excess and spectacle in the heart of Texas.",
    matchCities: ["Dallas", "Arlington"],
  },
  {
    id: "nrg",
    name: "NRG Stadium",
    officialName: "Houston Stadium",
    city: "Houston",
    country: "USA",
    capacity: 72_000,
    opened: 2002,
    roof: "Retractable Roof",
    surface: "Natural Grass",
    tenants: "Houston Texans (NFL)",
    distinction: "Retractable Colossus",
    accent: "#E03A3E",
    funFact:
      "The first NFL stadium with a retractable roof — closing it traps a wall of Houston noise over the pitch.",
    description:
      "Houston's retractable-roof colossus, built for extremes of weather and atmosphere.",
    matchCities: ["Houston"],
  },
  {
    id: "hard-rock",
    name: "Hard Rock Stadium",
    officialName: "Miami Stadium",
    city: "Miami",
    country: "USA",
    capacity: 65_000,
    opened: 1987,
    roof: "Open Air (Shade Canopy)",
    surface: "Natural Grass",
    tenants: "Miami Dolphins (NFL)",
    distinction: "Third-Place Play-off",
    accent: "#00B3B8",
    funFact:
      "Will stage the third-place play-off; its shade canopy keeps the Florida sun off every seat but the pitch.",
    description:
      "Miami's sunbaked open-air arena, where South American passion will find familiar heat.",
    matchCities: ["Miami", "Miami Gardens"],
  },
  {
    id: "lumen",
    name: "Lumen Field",
    officialName: "Seattle Stadium",
    city: "Seattle",
    country: "USA",
    capacity: 69_000,
    opened: 2002,
    roof: "Partial Cover",
    surface: "Natural Grass",
    tenants: "Seattle Seahawks & Sounders",
    distinction: "The Loudest Field",
    accent: "#5FC52B",
    funFact:
      "Engineered to bounce crowd noise back onto the field — its fans have triggered minor seismic readings.",
    description:
      "Seattle's fortress in the Pacific Northwest. Famous for crowd noise that disrupts radio communications.",
    matchCities: ["Seattle"],
  },
  {
    id: "arrowhead",
    name: "GEHA Field at Arrowhead",
    officialName: "Kansas City Stadium",
    city: "Kansas City",
    country: "USA",
    capacity: 76_000,
    opened: 1972,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "Kansas City Chiefs (NFL)",
    distinction: "World-Record Roar",
    accent: "#E8472B",
    funFact:
      "Holds the Guinness record for the loudest outdoor stadium — 142.2 decibels, louder than a jet engine.",
    description:
      "Consistently voted the loudest stadium in the NFL. A cauldron in Kansas City.",
    matchCities: ["Kansas City"],
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz Stadium",
    officialName: "Atlanta Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 71_000,
    opened: 2017,
    roof: "Retractable Roof",
    surface: "Natural Grass",
    tenants: "Atlanta Falcons & United",
    distinction: "Semi-Final",
    accent: "#D32230",
    funFact:
      "Its eight-petal retractable roof opens like a camera aperture above the pitch.",
    description:
      "Atlanta's architectural marvel — a retractable roof shaped like a falcon's wings.",
    matchCities: ["Atlanta"],
  },
  {
    id: "lincoln",
    name: "Lincoln Financial Field",
    officialName: "Philadelphia Stadium",
    city: "Philadelphia",
    country: "USA",
    capacity: 69_000,
    opened: 2003,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "Philadelphia Eagles (NFL)",
    distinction: "Northeast Fortress",
    accent: "#1FA488",
    funFact:
      "Home to the most passionate — and unforgiving — crowd in American sport.",
    description:
      "Philadelphia's iconic stadium, where the city's fierce sporting identity runs deepest.",
    matchCities: ["Philadelphia"],
  },
  {
    id: "gillette",
    name: "Gillette Stadium",
    officialName: "Boston Stadium",
    city: "Foxborough",
    country: "USA",
    capacity: 65_000,
    opened: 2002,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "New England Patriots & Revolution",
    distinction: "New England's Cathedral",
    accent: "#3F6AB0",
    funFact:
      "Reopened with a rebuilt north end and a new lighthouse — the landmark of New England football.",
    description:
      "New England's cathedral, home to the most successful dynasty in American sports history.",
    matchCities: ["Boston", "Foxborough"],
  },
  {
    id: "levis",
    name: "Levi's Stadium",
    officialName: "San Francisco Bay Area Stadium",
    city: "San Francisco Bay Area",
    country: "USA",
    capacity: 68_500,
    opened: 2014,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "San Francisco 49ers (NFL)",
    distinction: "Silicon Valley Showpiece",
    accent: "#C7372E",
    funFact:
      "One of the most tech-wired stadiums on earth — a Silicon Valley showpiece in Santa Clara.",
    description:
      "The San Francisco Bay Area's stadium in Santa Clara — a tech-forward arena where Silicon Valley welcomes the world.",
    matchCities: ["San Francisco Bay Area", "Santa Clara"],
  },

  // ── Mexico (3) ────────────────────────────────────────────────────────────
  {
    id: "azteca",
    name: "Estadio Azteca",
    officialName: "Estadio Ciudad de México",
    city: "Mexico City",
    country: "Mexico",
    capacity: 83_000,
    opened: 1966,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "Club América & Mexico NT",
    distinction: "Opening Match",
    accent: "#16A34A",
    elevation: "2,200 m above sea level",
    funFact:
      "The only stadium ever to host three men's World Cups (1970, 1986, 2026) — and it opens the 2026 tournament.",
    description:
      "The most iconic stadium in World Cup history. Scene of Maradona's Hand of God and Goal of the Century. This is where football mythology lives.",
    matchCities: ["Mexico City"],
  },
  {
    id: "akron",
    name: "Estadio Akron",
    officialName: "Estadio Guadalajara",
    city: "Guadalajara",
    country: "Mexico",
    capacity: 48_000,
    opened: 2010,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "C.D. Guadalajara (Chivas)",
    distinction: "Forest Amphitheatre",
    accent: "#E0322F",
    elevation: "1,566 m above sea level",
    funFact:
      "Built inside the Bosque de la Primavera forest reserve, its bowl seems to sink into the earth.",
    description:
      "Guadalajara's modern arena, nestled in the Bosque de la Primavera nature reserve.",
    matchCities: ["Guadalajara", "Zapopan"],
  },
  {
    id: "bbva",
    name: "Estadio BBVA",
    officialName: "Estadio Monterrey",
    city: "Monterrey",
    country: "Mexico",
    capacity: 53_500,
    opened: 2015,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "C.F. Monterrey (Rayados)",
    distinction: "Mountain Backdrop",
    accent: "#2E6BE6",
    funFact:
      "The open end frames the Cerro de la Silla mountain — a postcard behind every goal.",
    description:
      "Monterrey's mountain-ringed stadium, the Cerro de la Silla as backdrop for every match.",
    matchCities: ["Monterrey", "Guadalupe"],
  },

  // ── Canada (2) ────────────────────────────────────────────────────────────
  {
    id: "bc-place",
    name: "BC Place",
    officialName: "Vancouver Stadium",
    city: "Vancouver",
    country: "Canada",
    capacity: 54_500,
    opened: 1983,
    roof: "Retractable Roof",
    surface: "Natural Grass",
    tenants: "BC Lions & Whitecaps FC",
    distinction: "Retractable Landmark",
    accent: "#2F73C9",
    funFact:
      "Its cable-supported retractable roof is one of the largest of its kind in the world.",
    description:
      "Vancouver's domed stadium where the Pacific Northwest meets the world.",
    matchCities: ["Vancouver"],
  },
  {
    id: "bmo",
    name: "BMO Field",
    officialName: "Toronto Stadium",
    city: "Toronto",
    country: "Canada",
    capacity: 45_000,
    opened: 2007,
    roof: "Open Air",
    surface: "Natural Grass",
    tenants: "Toronto FC & Argonauts",
    distinction: "Canada's Home",
    accent: "#D72654",
    funFact:
      "Expanded for 2026 to host Canada's first-ever men's World Cup matches on home soil.",
    description:
      "Toronto's compact, electric stadium — Canada's home of football in their defining World Cup moment.",
    matchCities: ["Toronto"],
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
