export interface GlobeTeamData {
  name: string;
  code: string;
  lat: number;
  lng: number;
  group?: string;
  ranking?: number;
}

// All 48 Nations for the FIFA World Cup 2026
// For V1, including all likely 48 qualified/representative nations with coordinates.
export const globeTeams: GlobeTeamData[] = [
  // Hosts
  { name: "United States", code: "USA", lat: 37.0902, lng: -95.7129, group: "A", ranking: 11 },
  { name: "Mexico", code: "MEX", lat: 23.6345, lng: -102.5528, group: "A", ranking: 15 },
  { name: "Canada", code: "CAN", lat: 56.1304, lng: -106.3468, group: "A", ranking: 48 },
  
  // CONMEBOL (South America) - 6 slots
  { name: "Argentina", code: "ARG", lat: -38.4161, lng: -63.6167, group: "B", ranking: 1 },
  { name: "Brazil", code: "BRA", lat: -14.235, lng: -51.9253, group: "C", ranking: 5 },
  { name: "Uruguay", code: "URU", lat: -32.5228, lng: -55.7658, group: "D", ranking: 11 },
  { name: "Colombia", code: "COL", lat: 4.5709, lng: -74.2973, group: "E", ranking: 14 },
  { name: "Ecuador", code: "ECU", lat: -1.8312, lng: -78.1834, group: "F", ranking: 31 },
  { name: "Venezuela", code: "VEN", lat: 6.4238, lng: -66.5897, group: "G", ranking: 52 },

  // UEFA (Europe) - 16 slots
  { name: "France", code: "FRA", lat: 46.2276, lng: 2.2137, group: "B", ranking: 2 },
  { name: "England", code: "ENG", lat: 52.3555, lng: -1.1743, group: "C", ranking: 3 },
  { name: "Belgium", code: "BEL", lat: 50.5039, lng: 4.4699, group: "D", ranking: 4 },
  { name: "Netherlands", code: "NED", lat: 52.1326, lng: 5.2913, group: "E", ranking: 6 },
  { name: "Portugal", code: "POR", lat: 39.3999, lng: -8.2245, group: "F", ranking: 7 },
  { name: "Spain", code: "ESP", lat: 40.4637, lng: -3.7492, group: "G", ranking: 8 },
  { name: "Italy", code: "ITA", lat: 41.8719, lng: 12.5674, group: "H", ranking: 9 },
  { name: "Croatia", code: "CRO", lat: 45.1, lng: 15.2, group: "I", ranking: 10 },
  { name: "Germany", code: "GER", lat: 51.1657, lng: 10.4515, group: "J", ranking: 16 },
  { name: "Switzerland", code: "SUI", lat: 46.8182, lng: 8.2275, group: "K", ranking: 19 },
  { name: "Denmark", code: "DEN", lat: 56.2639, lng: 9.5018, group: "L", ranking: 21 },
  { name: "Ukraine", code: "UKR", lat: 48.3794, lng: 31.1656, group: "A", ranking: 22 },
  { name: "Austria", code: "AUT", lat: 47.5162, lng: 14.5501, group: "B", ranking: 25 },
  { name: "Sweden", code: "SWE", lat: 60.1282, lng: 18.6435, group: "C", ranking: 26 },
  { name: "Poland", code: "POL", lat: 51.9194, lng: 19.1451, group: "D", ranking: 28 },
  { name: "Serbia", code: "SRB", lat: 44.0165, lng: 21.0059, group: "E", ranking: 32 },

  // CAF (Africa) - 9 slots
  { name: "Morocco", code: "MAR", lat: 31.7917, lng: -7.0926, group: "H", ranking: 12 },
  { name: "Senegal", code: "SEN", lat: 14.4974, lng: -14.4524, group: "I", ranking: 17 },
  { name: "Nigeria", code: "NGA", lat: 9.082, lng: 8.6753, group: "J", ranking: 28 },
  { name: "Egypt", code: "EGY", lat: 26.8206, lng: 30.8025, group: "K", ranking: 36 },
  { name: "Ivory Coast", code: "CIV", lat: 7.54, lng: -5.5471, group: "L", ranking: 39 },
  { name: "Tunisia", code: "TUN", lat: 33.8869, lng: 9.5375, group: "G", ranking: 41 },
  { name: "Algeria", code: "ALG", lat: 28.0339, lng: 1.6596, group: "H", ranking: 43 },
  { name: "Mali", code: "MLI", lat: 17.5707, lng: -3.9962, group: "I", ranking: 47 },
  { name: "Cameroon", code: "CMR", lat: 3.848, lng: 11.5021, group: "J", ranking: 51 },

  // AFC (Asia) - 8 slots
  { name: "Japan", code: "JPN", lat: 36.2048, lng: 138.2529, group: "K", ranking: 18 },
  { name: "Iran", code: "IRN", lat: 32.4279, lng: 53.688, group: "L", ranking: 20 },
  { name: "South Korea", code: "KOR", lat: 35.9078, lng: 127.7669, group: "A", ranking: 22 },
  { name: "Australia", code: "AUS", lat: -25.2744, lng: 133.7751, group: "B", ranking: 24 },
  { name: "Saudi Arabia", code: "KSA", lat: 23.8859, lng: 45.0792, group: "C", ranking: 53 },
  { name: "Qatar", code: "QAT", lat: 25.3548, lng: 51.1839, group: "D", ranking: 37 },
  { name: "Iraq", code: "IRQ", lat: 33.2232, lng: 43.6793, group: "E", ranking: 58 },
  { name: "Uzbekistan", code: "UZB", lat: 41.3775, lng: 64.5853, group: "F", ranking: 66 },

  // CONCACAF (North America) - 3 extra slots beyond hosts
  { name: "Panama", code: "PAN", lat: 8.538, lng: -80.7821, group: "G", ranking: 44 },
  { name: "Costa Rica", code: "CRC", lat: 9.7489, lng: -83.7534, group: "H", ranking: 54 },
  { name: "Jamaica", code: "JAM", lat: 18.1096, lng: -77.2975, group: "I", ranking: 55 },

  // OFC (Oceania) - 1 slot
  { name: "New Zealand", code: "NZL", lat: -40.9006, lng: 174.886, group: "J", ranking: 104 },

  // Inter-confederation play-offs - 2 slots
  { name: "Scotland", code: "SCO", lat: 56.4907, lng: -4.2026, group: "K", ranking: 34 },
  { name: "Paraguay", code: "PAR", lat: -23.4425, lng: -58.4438, group: "L", ranking: 49 },
];
