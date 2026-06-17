// groups.ts
export interface Group {
  name: string;
  letter: string;
  teams: [string, string, string, string];
}
export const GROUPS: Group[] = [
  { name: "Group A", letter: "A", teams: ["MEX", "RSA", "KOR", "CZE"] },
  { name: "Group B", letter: "B", teams: ["CAN", "BIH", "QAT", "SUI"] },
  { name: "Group C", letter: "C", teams: ["BRA", "MAR", "HAI", "SCO"] },
  { name: "Group D", letter: "D", teams: ["USA", "PAR", "AUS", "TUR"] },
  { name: "Group E", letter: "E", teams: ["GER", "CUR", "CIV", "ECU"] },
  { name: "Group F", letter: "F", teams: ["NED", "JPN", "SWE", "TUN"] },
  { name: "Group G", letter: "G", teams: ["BEL", "EGY", "IRN", "NZL"] },
  { name: "Group H", letter: "H", teams: ["ESP", "CPV", "KSA", "URU"] },
  { name: "Group I", letter: "I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  { name: "Group J", letter: "J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  { name: "Group K", letter: "K", teams: ["POR", "COD", "UZB", "COL"] },
  { name: "Group L", letter: "L", teams: ["ENG", "CRO", "GHA", "PAN"] },
];
export function getGroupForTeam(code: string): Group | undefined {
  return GROUPS.find((g) => g.teams.includes(code));
}
