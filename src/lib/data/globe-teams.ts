export interface GlobeTeamData {
  name: string;
  code: string;
  lat: number;
  lng: number;
  group?: string;
  ranking?: number;
}

// The 48 FIFA World Cup 2026 nations.
// This list is kept in lockstep with groups.ts / teams.ts: every code, name and
// group letter here MUST exist there, so country selection resolves a group,
// matches and (where available) a full team profile. Coordinates are country
// centroids used to place the markers on the globe.
export const globeTeams: GlobeTeamData[] = [
  // ── Group A ──────────────────────────────────────────────────────────────
  { name: "Mexico", code: "MEX", lat: 23.6345, lng: -102.5528, group: "A", ranking: 17 },
  { name: "South Africa", code: "RSA", lat: -30.5595, lng: 22.9375, group: "A", ranking: 60 },
  { name: "South Korea", code: "KOR", lat: 35.9078, lng: 127.7669, group: "A", ranking: 23 },
  { name: "Czech Republic", code: "CZE", lat: 49.8175, lng: 15.4730, group: "A", ranking: 40 },

  // ── Group B ──────────────────────────────────────────────────────────────
  { name: "Canada", code: "CAN", lat: 56.1304, lng: -106.3468, group: "B", ranking: 31 },
  { name: "Bosnia & Herzegovina", code: "BIH", lat: 43.9159, lng: 17.6791, group: "B", ranking: 74 },
  { name: "Qatar", code: "QAT", lat: 25.3548, lng: 51.1839, group: "B", ranking: 37 },
  { name: "Switzerland", code: "SUI", lat: 46.8182, lng: 8.2275, group: "B", ranking: 19 },

  // ── Group C ──────────────────────────────────────────────────────────────
  { name: "Brazil", code: "BRA", lat: -14.2350, lng: -51.9253, group: "C", ranking: 5 },
  { name: "Morocco", code: "MAR", lat: 31.7917, lng: -7.0926, group: "C", ranking: 12 },
  { name: "Haiti", code: "HAI", lat: 18.9712, lng: -72.2852, group: "C", ranking: 83 },
  { name: "Scotland", code: "SCO", lat: 56.4907, lng: -4.2026, group: "C", ranking: 39 },

  // ── Group D ──────────────────────────────────────────────────────────────
  { name: "USA", code: "USA", lat: 37.0902, lng: -95.7129, group: "D", ranking: 16 },
  { name: "Paraguay", code: "PAR", lat: -23.4425, lng: -58.4438, group: "D", ranking: 50 },
  { name: "Australia", code: "AUS", lat: -25.2744, lng: 133.7751, group: "D", ranking: 26 },
  { name: "Turkey", code: "TUR", lat: 38.9637, lng: 35.2433, group: "D", ranking: 27 },

  // ── Group E ──────────────────────────────────────────────────────────────
  { name: "Germany", code: "GER", lat: 51.1657, lng: 10.4515, group: "E", ranking: 9 },
  { name: "Curaçao", code: "CUR", lat: 12.1696, lng: -68.9900, group: "E", ranking: 82 },
  { name: "Ivory Coast", code: "CIV", lat: 7.5400, lng: -5.5471, group: "E", ranking: 41 },
  { name: "Ecuador", code: "ECU", lat: -1.8312, lng: -78.1834, group: "E", ranking: 24 },

  // ── Group F ──────────────────────────────────────────────────────────────
  { name: "Netherlands", code: "NED", lat: 52.1326, lng: 5.2913, group: "F", ranking: 7 },
  { name: "Japan", code: "JPN", lat: 36.2048, lng: 138.2529, group: "F", ranking: 18 },
  { name: "Sweden", code: "SWE", lat: 60.1282, lng: 18.6435, group: "F", ranking: 35 },
  { name: "Tunisia", code: "TUN", lat: 33.8869, lng: 9.5375, group: "F", ranking: 49 },

  // ── Group G ──────────────────────────────────────────────────────────────
  { name: "Belgium", code: "BEL", lat: 50.5039, lng: 4.4699, group: "G", ranking: 8 },
  { name: "Egypt", code: "EGY", lat: 26.8206, lng: 30.8025, group: "G", ranking: 36 },
  { name: "Iran", code: "IRN", lat: 32.4279, lng: 53.6880, group: "G", ranking: 20 },
  { name: "New Zealand", code: "NZL", lat: -40.9006, lng: 174.8860, group: "G", ranking: 89 },

  // ── Group H ──────────────────────────────────────────────────────────────
  { name: "Spain", code: "ESP", lat: 40.4637, lng: -3.7492, group: "H", ranking: 3 },
  { name: "Cape Verde", code: "CPV", lat: 16.5388, lng: -23.0418, group: "H", ranking: 70 },
  { name: "Saudi Arabia", code: "KSA", lat: 23.8859, lng: 45.0792, group: "H", ranking: 53 },
  { name: "Uruguay", code: "URU", lat: -32.5228, lng: -55.7658, group: "H", ranking: 15 },

  // ── Group I ──────────────────────────────────────────────────────────────
  { name: "France", code: "FRA", lat: 46.2276, lng: 2.2137, group: "I", ranking: 2 },
  { name: "Senegal", code: "SEN", lat: 14.4974, lng: -14.4524, group: "I", ranking: 21 },
  { name: "Iraq", code: "IRQ", lat: 33.2232, lng: 43.6793, group: "I", ranking: 58 },
  { name: "Norway", code: "NOR", lat: 60.4720, lng: 8.4689, group: "I", ranking: 33 },

  // ── Group J ──────────────────────────────────────────────────────────────
  { name: "Argentina", code: "ARG", lat: -38.4161, lng: -63.6167, group: "J", ranking: 1 },
  { name: "Algeria", code: "ALG", lat: 28.0339, lng: 1.6596, group: "J", ranking: 43 },
  { name: "Austria", code: "AUT", lat: 47.5162, lng: 14.5501, group: "J", ranking: 22 },
  { name: "Jordan", code: "JOR", lat: 30.5852, lng: 36.2384, group: "J", ranking: 64 },

  // ── Group K ──────────────────────────────────────────────────────────────
  { name: "Portugal", code: "POR", lat: 39.3999, lng: -8.2245, group: "K", ranking: 6 },
  { name: "DR Congo", code: "COD", lat: -4.0383, lng: 21.7587, group: "K", ranking: 56 },
  { name: "Uzbekistan", code: "UZB", lat: 41.3775, lng: 64.5853, group: "K", ranking: 57 },
  { name: "Colombia", code: "COL", lat: 4.5709, lng: -74.2973, group: "K", ranking: 13 },

  // ── Group L ──────────────────────────────────────────────────────────────
  { name: "England", code: "ENG", lat: 52.3555, lng: -1.1743, group: "L", ranking: 4 },
  { name: "Croatia", code: "CRO", lat: 45.1000, lng: 15.2000, group: "L", ranking: 10 },
  { name: "Ghana", code: "GHA", lat: 7.9465, lng: -1.0232, group: "L", ranking: 73 },
  { name: "Panama", code: "PAN", lat: 8.5380, lng: -80.7821, group: "L", ranking: 44 },
];
