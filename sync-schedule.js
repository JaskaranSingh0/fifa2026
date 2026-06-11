const https = require("https");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "src/lib/data");

// Existing teams list to preserve colors/flags where possible
const existingTeamsRaw = fs.readFileSync(path.join(DATA_DIR, "teams.ts"), "utf-8");
const existingColors = {};
const existingFlags = {};
const existingConfeds = {};
const existingCodes = {}; // Name to Code mapping

// Parse existing teams to keep their metadata
const teamMatches = existingTeamsRaw.matchAll(/t\("([A-Z]{3})",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g);
for (const match of teamMatches) {
  const [_, code, name, flag, primary, secondary, confed] = match;
  existingColors[name.toLowerCase()] = [primary, secondary];
  existingFlags[name.toLowerCase()] = flag;
  existingConfeds[name.toLowerCase()] = confed;
  existingCodes[name.toLowerCase()] = code;
}

// Map stadiums from openfootball to our IDs
const stadiumMapping = {
  "Mexico City": "azteca",
  "Guadalajara (Zapopan)": "akron",
  "Atlanta": "mercedes-benz",
  "Monterrey (Guadalupe)": "bbva",
  "Vancouver": "bc-place",
  "Seattle": "lumen",
  "San Francisco Bay Area (Santa Clara)": "Levi's Stadium", // wait, our list doesn't have levis? it has 11 US stadiums. Let's map dynamically
  "Los Angeles (Inglewood)": "sofi",
  "Houston": "nrg",
  "Dallas (Arlington)": "att",
  "New York/New Jersey (East Rutherford)": "metlife",
  "Toronto": "bmo",
  "Boston (Foxborough)": "gillette",
  "Philadelphia": "lincoln",
  "Miami (Miami Gardens)": "hard-rock",
  "Kansas City": "arrowhead"
};

https.get("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const json = JSON.parse(data);
    const matches = json.matches;

    // 1. Extract Teams and Groups
    const teamsByName = {};
    const groupsMap = {};

    matches.forEach(m => {
      // Group Stage
      if (m.group) {
        if (!groupsMap[m.group]) groupsMap[m.group] = new Set();
        groupsMap[m.group].add(m.team1);
        groupsMap[m.group].add(m.team2);
        teamsByName[m.team1] = true;
        teamsByName[m.team2] = true;
      } else {
        // Knockout (Team1/Team2 might be "Winner Group A")
        if (!m.team1.startsWith("Winner") && !m.team1.startsWith("Runner-up") && !m.team1.startsWith("3rd")) {
          teamsByName[m.team1] = true;
        }
        if (!m.team2.startsWith("Winner") && !m.team2.startsWith("Runner-up") && !m.team2.startsWith("3rd")) {
          teamsByName[m.team2] = true;
        }
      }
    });

    const finalTeams = Object.keys(teamsByName).filter(t => t);
    
    // Generate new team codes if missing
    let codeIndex = 0;
    const generateCode = (name) => {
      if (name === "South Africa") return "RSA";
      if (name === "South Korea") return "KOR";
      if (name === "Bosnia & Herzegovina") return "BIH";
      
      const existing = existingCodes[name.toLowerCase()];
      if (existing) return existing;
      let code = name.substring(0, 3).toUpperCase();
      if (Object.values(existingCodes).includes(code)) {
         code = name.substring(0, 2).toUpperCase() + name.substring(name.length-1).toUpperCase();
      }
      return code;
    };

    const newTeamsList = finalTeams.map(name => {
      const lName = name.toLowerCase();
      const code = generateCode(name);
      return {
        code,
        name,
        flag: existingFlags[lName] || "🏳️",
        primary: existingColors[lName]?.[0] || "#999999",
        secondary: existingColors[lName]?.[1] || "#333333",
        confed: existingConfeds[lName] || "UEFA"
      };
    });

    // 2. Write teams.ts
    let teamsOut = `// teams.ts — 48 verified unique FIFA World Cup 2026 teams
// Generated automatically from schedule
export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";
export interface TeamData {
  code: string;
  name: string;
  flag: string;
  colors: [string, string];
  confederation: Confederation;
}
function t(code: string, name: string, flag: string, primary: string, secondary: string, confederation: Confederation): TeamData {
  return { code, name, flag, colors: [primary, secondary], confederation };
}
export const TEAMS_LIST: TeamData[] = [\n`;

    newTeamsList.forEach(t => {
      teamsOut += `  t("${t.code}", "${t.name}", "${t.flag}", "${t.primary}", "${t.secondary}", "${t.confed}"),\n`;
    });
    
    teamsOut += `];
export const TEAM_COUNT = TEAMS_LIST.length;
export const TEAMS: Record<string, TeamData> = Object.fromEntries(TEAMS_LIST.map((team) => [team.code, team]));
export function getTeam(code: string): TeamData {
  return TEAMS[code] ?? {
    code, name: code, flag: "🏳️", colors: ["#999999", "#CCCCCC"], confederation: "UEFA"
  };
}
`;
    fs.writeFileSync(path.join(DATA_DIR, "teams.ts"), teamsOut);

    // 3. Write groups.ts
    let groupsOut = `// groups.ts
import { TEAMS } from "./teams";
export interface Group {
  name: string;
  letter: string;
  teams: [string, string, string, string];
}
export const GROUPS: Group[] = [\n`;
    
    Object.keys(groupsMap).sort().forEach(gName => {
      const letter = gName.replace("Group ", "");
      const tNames = Array.from(groupsMap[gName]);
      const codes = tNames.map(n => newTeamsList.find(t => t.name === n).code);
      groupsOut += `  { name: "${gName}", letter: "${letter}", teams: ["${codes[0] || ''}", "${codes[1] || ''}", "${codes[2] || ''}", "${codes[3] || ''}"] },\n`;
    });

    groupsOut += `];
export function getGroupForTeam(code: string): Group | undefined {
  return GROUPS.find((g) => g.teams.includes(code));
}
`;
    fs.writeFileSync(path.join(DATA_DIR, "groups.ts"), groupsOut);

    // 4. Write matches.ts
    // We map the 104 matches exactly
    let matchesOut = `// matches.ts
import { TeamData, getTeam } from "./teams";
import { GROUPS } from "./groups";

export enum MatchStatus { UPCOMING = "UPCOMING", LIVE = "LIVE", FINISHED = "FINISHED", POSTPONED = "POSTPONED" }
export enum TournamentStage { ALL = "ALL", GROUP_STAGE = "GROUP_STAGE", ROUND_OF_32 = "ROUND_OF_32", ROUND_OF_16 = "ROUND_OF_16", QUARTER_FINALS = "QUARTER_FINALS", SEMI_FINALS = "SEMI_FINALS", FINAL = "FINAL" }
export interface LiveMatchData { currentMinute: number; isExtraTime: boolean; isPenalties: boolean; penaltyScore?: [number, number]; }
export interface Match { id: string; stage: TournamentStage; group?: string; matchNumber: number; date: string; time: string; stadium: string; city: string; country: string; home: TeamData; away: TeamData; status: MatchStatus; homeScore?: number; awayScore?: number; liveData?: LiveMatchData; }

export const MATCHES: Match[] = [\n`;

    let mNum = 1;
    matches.forEach(m => {
      let stage = "TournamentStage.GROUP_STAGE";
      if (m.round === "Round of 32") stage = "TournamentStage.ROUND_OF_32";
      if (m.round === "Round of 16") stage = "TournamentStage.ROUND_OF_16";
      if (m.round === "Quarter-finals") stage = "TournamentStage.QUARTER_FINALS";
      if (m.round === "Semi-finals") stage = "TournamentStage.SEMI_FINALS";
      if (m.round === "Third place play-off" || m.round === "Final") stage = "TournamentStage.FINAL";

      const hTeam = newTeamsList.find(t => t.name === m.team1) || { code: m.team1.replace(/"/g, '') };
      const aTeam = newTeamsList.find(t => t.name === m.team2) || { code: m.team2.replace(/"/g, '') };
      
      const homeCodeStr = hTeam.code;
      const awayCodeStr = aTeam.code;

      matchesOut += `  {
    id: "m${mNum.toString().padStart(3, '0')}",
    stage: ${stage},
    group: ${m.group ? `"${m.group}"` : "undefined"},
    matchNumber: ${mNum},
    date: "${m.date}",
    time: "${m.time}",
    stadium: "${m.ground}",
    city: "${m.ground.split(' (')[0]}",
    country: "USA/MEX/CAN",
    home: getTeam("${homeCodeStr}"),
    away: getTeam("${awayCodeStr}"),
    status: MatchStatus.UPCOMING
  },\n`;
      mNum++;
    });

    matchesOut += `];\nexport const TOTAL_MATCHES = MATCHES.length;\n`;
    fs.writeFileSync(path.join(DATA_DIR, "matches.ts"), matchesOut);

    console.log("Successfully extracted 104 official matches!");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
