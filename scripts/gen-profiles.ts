/* One-time generator for src/lib/data/team-profiles.ts
 * Squads + kit colors come from ESPN (accurate, all 48). Team facts are a
 * curated map (reliable historical record + web-verified coaches/captains);
 * anything not confidently known is left blank rather than fabricated.
 * Run: npx tsx scripts/gen-profiles.ts
 */
import { writeFileSync } from "fs";
import { TEAMS_LIST } from "../src/lib/data/teams";
import { globeTeams } from "../src/lib/data/globe-teams";
import { normalizeTeamName } from "../src/lib/match-sync";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

type Fact = {
  conf: "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";
  nick?: string;
  titles?: number;
  apps?: number;
  best?: string;
  coach?: string;
  capt?: string;
  star?: string;
  stadium?: string;
  lastTitle?: string;
  desc?: string; // optional hand-written bio (marquee teams)
};

// Curated facts. Historical (conf/titles/best/apps/nick) from record;
// coach/captain web-verified where shown earlier or confidently known; blank if unsure.
const FACTS: Record<string, Fact> = {
  // ── Group A ──
  MEX: { conf: "CONCACAF", nick: "El Tri", titles: 0, apps: 18, best: "Quarter-finals (1970, 1986)", coach: "Javier Aguirre", capt: "Edson Álvarez", star: "Santiago Giménez", stadium: "Estadio Azteca" },
  RSA: { conf: "CAF", nick: "Bafana Bafana", titles: 0, apps: 4, best: "Group stage", coach: "Hugo Broos", capt: "Ronwen Williams", stadium: "FNB Stadium" },
  KOR: { conf: "AFC", nick: "Taegeuk Warriors", titles: 0, apps: 12, best: "Fourth place (2002)", coach: "Hong Myung-bo", capt: "Son Heung-min", star: "Son Heung-min", stadium: "Seoul World Cup Stadium" },
  CZE: { conf: "UEFA", nick: "Národní tým", titles: 0, apps: 11, best: "Runners-up (1934, 1962, as Czechoslovakia)", coach: "Miroslav Koubek", capt: "Ladislav Krejčí", stadium: "Eden Arena" },
  // ── Group B ──
  CAN: { conf: "CONCACAF", nick: "Les Rouges", titles: 0, apps: 3, best: "Group stage", coach: "Jesse Marsch", capt: "Alphonso Davies", star: "Alphonso Davies", stadium: "BMO Field" },
  BIH: { conf: "UEFA", nick: "Zmajevi (Dragons)", titles: 0, apps: 2, best: "Group stage (2014)", coach: "Sergej Barbarez", capt: "Edin Džeko", star: "Edin Džeko", stadium: "Bilino Polje" },
  QAT: { conf: "AFC", nick: "The Maroon", titles: 0, apps: 2, best: "Group stage", coach: "Julen Lopetegui", capt: "Hassan Al-Haydos", stadium: "Lusail Stadium" },
  SUI: { conf: "UEFA", nick: "Nati", titles: 0, apps: 13, best: "Quarter-finals (1934, 1938, 1954)", coach: "Murat Yakin", capt: "Granit Xhaka", star: "Granit Xhaka", stadium: "St. Jakob-Park" },
  // ── Group C ──
  BRA: { conf: "CONMEBOL", nick: "Seleção", titles: 5, apps: 23, best: "Champions", lastTitle: "2002", coach: "Carlo Ancelotti", capt: "Marquinhos", star: "Vinícius Júnior", stadium: "Maracanã", desc: "The most successful nation in World Cup history and the only one to play every edition. Five-time champions chasing a record-extending sixth, with the swagger the yellow shirt always carries." },
  MAR: { conf: "CAF", nick: "Atlas Lions", titles: 0, apps: 7, best: "Fourth place (2022)", coach: "Walid Regragui", capt: "Achraf Hakimi", star: "Achraf Hakimi", stadium: "Stade Mohammed V" },
  HAI: { conf: "CONCACAF", nick: "Les Grenadiers", titles: 0, apps: 2, best: "Group stage (1974)", stadium: "Stade Sylvio Cator" },
  SCO: { conf: "UEFA", nick: "Tartan Army", titles: 0, apps: 9, best: "Group stage", coach: "Steve Clarke", capt: "Andrew Robertson", star: "Andrew Robertson", stadium: "Hampden Park" },
  // ── Group D ──
  USA: { conf: "CONCACAF", nick: "The Stars and Stripes", titles: 0, apps: 12, best: "Third place (1930)", coach: "Mauricio Pochettino", capt: "Christian Pulisic", star: "Christian Pulisic", stadium: "" },
  PAR: { conf: "CONMEBOL", nick: "La Albirroja", titles: 0, apps: 9, best: "Quarter-finals (2010)", coach: "Gustavo Alfaro", capt: "Gustavo Gómez", stadium: "Estadio Defensores del Chaco" },
  AUS: { conf: "AFC", nick: "Socceroos", titles: 0, apps: 7, best: "Round of 16 (2006, 2022)", coach: "Tony Popovic", capt: "Mathew Ryan", stadium: "Stadium Australia" },
  TUR: { conf: "UEFA", nick: "Ay-Yıldızlılar (Crescent-Stars)", titles: 0, apps: 3, best: "Third place (2002)", coach: "Vincenzo Montella", capt: "Hakan Çalhanoğlu", star: "Arda Güler", stadium: "" },
  // ── Group E ──
  GER: { conf: "UEFA", nick: "Die Mannschaft", titles: 4, apps: 21, best: "Champions", lastTitle: "2014", coach: "Julian Nagelsmann", capt: "Joshua Kimmich", star: "Jamal Musiala", stadium: "Olympiastadion", desc: "Four-time world champions and the tournament's great machine. After group-stage exits in 2018 and 2022, a young Germany arrives in North America determined to restore the standard." },
  CUR: { conf: "CONCACAF", nick: "Famia Korsou", titles: 0, apps: 1, best: "Debut", coach: "Dick Advocaat", stadium: "Ergilio Hato Stadium" },
  CIV: { conf: "CAF", nick: "Les Éléphants", titles: 0, apps: 4, best: "Group stage", coach: "Emerse Faé", capt: "Franck Kessié", stadium: "Stade Félix Houphouët-Boigny" },
  ECU: { conf: "CONMEBOL", nick: "La Tri", titles: 0, apps: 5, best: "Round of 16 (2006)", coach: "Sebastián Beccacece", capt: "Enner Valencia", star: "Moisés Caicedo", stadium: "Estadio Rodrigo Paz Delgado" },
  // ── Group F ──
  NED: { conf: "UEFA", nick: "Oranje", titles: 0, apps: 12, best: "Runners-up (1974, 1978, 2010)", coach: "Ronald Koeman", capt: "Virgil van Dijk", star: "Virgil van Dijk", stadium: "Johan Cruyff Arena" },
  JPN: { conf: "AFC", nick: "Samurai Blue", titles: 0, apps: 8, best: "Round of 16", coach: "Hajime Moriyasu", capt: "Wataru Endō", star: "Takefusa Kubo", stadium: "Saitama Stadium 2002" },
  SWE: { conf: "UEFA", nick: "Blågult", titles: 0, apps: 13, best: "Runners-up (1958)", coach: "", capt: "", star: "Alexander Isak", stadium: "Friends Arena" },
  TUN: { conf: "CAF", nick: "Eagles of Carthage", titles: 0, apps: 7, best: "Group stage", coach: "", capt: "", stadium: "Stade Hammadi Agrebi" },
  // ── Group G ──
  BEL: { conf: "UEFA", nick: "Red Devils", titles: 0, apps: 15, best: "Third place (2018)", coach: "Rudi Garcia", capt: "Kevin De Bruyne", star: "Kevin De Bruyne", stadium: "King Baudouin Stadium" },
  EGY: { conf: "CAF", nick: "The Pharaohs", titles: 0, apps: 4, best: "Group stage", coach: "Hossam Hassan", capt: "Mohamed Salah", star: "Mohamed Salah", stadium: "Cairo International Stadium" },
  IRN: { conf: "AFC", nick: "Team Melli", titles: 0, apps: 7, best: "Group stage", coach: "Amir Ghalenoei", capt: "Alireza Jahanbakhsh", star: "Mehdi Taremi", stadium: "Azadi Stadium" },
  NZL: { conf: "OFC", nick: "All Whites", titles: 0, apps: 3, best: "Group stage (undefeated, 2010)", coach: "Darren Bazeley", capt: "Chris Wood", star: "Chris Wood", stadium: "Eden Park" },
  // ── Group H ──
  ESP: { conf: "UEFA", nick: "La Roja", titles: 1, apps: 17, best: "Champions", lastTitle: "2010", coach: "Luis de la Fuente", capt: "Álvaro Morata", star: "Lamine Yamal", stadium: "Santiago Bernabéu", desc: "World champions in 2010 and reigning European champions, Spain bring the most exciting young generation on earth — Lamine Yamal at its dazzling head." },
  CPV: { conf: "CAF", nick: "Tubarões Azuis (Blue Sharks)", titles: 0, apps: 1, best: "Debut", stadium: "Estádio Nacional de Cabo Verde" },
  KSA: { conf: "AFC", nick: "The Green Falcons", titles: 0, apps: 7, best: "Round of 16 (1994)", coach: "Hervé Renard", capt: "Salem Al-Dawsari", star: "Salem Al-Dawsari", stadium: "King Fahd International Stadium" },
  URU: { conf: "CONMEBOL", nick: "La Celeste", titles: 2, apps: 15, best: "Champions", lastTitle: "1950", coach: "Marcelo Bielsa", capt: "Federico Valverde", star: "Federico Valverde", stadium: "Estadio Centenario", desc: "Two-time world champions and winners of the very first World Cup in 1930. Under Marcelo Bielsa, a fearless Uruguay blends that heritage with a thrilling new generation." },
  // ── Group I ──
  FRA: { conf: "UEFA", nick: "Les Bleus", titles: 2, apps: 17, best: "Champions", lastTitle: "2018", coach: "Didier Deschamps", capt: "Kylian Mbappé", star: "Kylian Mbappé", stadium: "Stade de France", desc: "Champions in 1998 and 2018 and finalists in 2022, France carry the deepest talent pool in world football — and Kylian Mbappé entering his prime." },
  SEN: { conf: "CAF", nick: "Lions of Teranga", titles: 0, apps: 4, best: "Quarter-finals (2002)", coach: "Pape Thiaw", capt: "Kalidou Koulibaly", star: "Nicolas Jackson", stadium: "Stade Abdoulaye Wade" },
  IRQ: { conf: "AFC", nick: "Lions of Mesopotamia", titles: 0, apps: 2, best: "Group stage (1986)", coach: "", capt: "", stadium: "Basra International Stadium" },
  NOR: { conf: "UEFA", nick: "Løvene (The Lions)", titles: 0, apps: 4, best: "Round of 16 (1998)", coach: "Ståle Solbakken", capt: "Martin Ødegaard", star: "Erling Haaland", stadium: "Ullevaal Stadion" },
  // ── Group J ──
  ARG: { conf: "CONMEBOL", nick: "La Albiceleste", titles: 3, apps: 19, best: "Champions", lastTitle: "2022", coach: "Lionel Scaloni", capt: "Lionel Messi", star: "Lionel Messi", stadium: "Estadio Monumental", desc: "The reigning world champions arrive in North America chasing back-to-back titles — something no nation has achieved since Brazil in 1962 — with Lionel Messi writing his final chapters." },
  ALG: { conf: "CAF", nick: "Les Fennecs (Desert Foxes)", titles: 0, apps: 5, best: "Round of 16 (2014)", coach: "Vladimir Petković", capt: "Riyad Mahrez", star: "Riyad Mahrez", stadium: "Stade du 5 Juillet 1962" },
  AUT: { conf: "UEFA", nick: "Das Team", titles: 0, apps: 8, best: "Third place (1954)", coach: "Ralf Rangnick", capt: "David Alaba", star: "David Alaba", stadium: "Ernst-Happel-Stadion" },
  JOR: { conf: "AFC", nick: "Al-Nashama", titles: 0, apps: 1, best: "Debut", coach: "Jamal Sellami", capt: "", stadium: "Amman International Stadium" },
  // ── Group K ──
  POR: { conf: "UEFA", nick: "A Seleção das Quinas", titles: 0, apps: 9, best: "Third place (1966)", coach: "Roberto Martínez", capt: "Cristiano Ronaldo", star: "Cristiano Ronaldo", stadium: "Estádio da Luz" },
  COD: { conf: "CAF", nick: "Léopards", titles: 0, apps: 2, best: "Group stage (1974, as Zaire)", coach: "Sébastien Desabre", capt: "Chancel Mbemba", stadium: "Stade des Martyrs" },
  UZB: { conf: "AFC", nick: "The White Wolves", titles: 0, apps: 1, best: "Debut", coach: "Timur Kapadze", capt: "Eldor Shomurodov", star: "Eldor Shomurodov", stadium: "Milliy Stadium" },
  COL: { conf: "CONMEBOL", nick: "Los Cafeteros", titles: 0, apps: 7, best: "Quarter-finals (2014)", coach: "Néstor Lorenzo", capt: "James Rodríguez", star: "Luis Díaz", stadium: "Estadio Metropolitano" },
  // ── Group L ──
  ENG: { conf: "UEFA", nick: "Three Lions", titles: 1, apps: 17, best: "Champions", lastTitle: "1966", coach: "Thomas Tuchel", capt: "Harry Kane", star: "Jude Bellingham", stadium: "Wembley Stadium", desc: "Champions on home soil in 1966 and semi-finalists and finalists in recent tournaments, England carry a golden generation — and the weight of ending a 60-year wait." },
  CRO: { conf: "UEFA", nick: "Vatreni (Blazers)", titles: 0, apps: 7, best: "Runners-up (2018)", coach: "Zlatko Dalić", capt: "Luka Modrić", star: "Luka Modrić", stadium: "Stadion Maksimir" },
  GHA: { conf: "CAF", nick: "Black Stars", titles: 0, apps: 5, best: "Quarter-finals (2010)", coach: "Otto Addo", capt: "Jordan Ayew", star: "Mohammed Kudus", stadium: "Accra Sports Stadium" },
  PAN: { conf: "CONCACAF", nick: "La Marea Roja (Red Tide)", titles: 0, apps: 2, best: "Group stage (2018)", coach: "Thomas Christiansen", capt: "Aníbal Godoy", stadium: "Estadio Rommel Fernández" },
};

const CONF_LONG: Record<string, string> = {
  UEFA: "European", CONMEBOL: "South American", CONCACAF: "North & Central American",
  CAF: "African", AFC: "Asian", OFC: "Oceanian",
};
const HOSTS = new Set(["USA", "MEX", "CAN"]);
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const posMap = (a: string): "GK" | "DF" | "MF" | "FW" =>
  a === "G" ? "GK" : a === "D" ? "DF" : a === "F" ? "FW" : "MF";

const nameToCode: Record<string, string> = {};
TEAMS_LIST.forEach((t) => { nameToCode[t.name] = t.code; });
const rankOf: Record<string, number> = {};
globeTeams.forEach((t) => { rankOf[t.code] = t.ranking ?? 0; });

function buildDesc(code: string, f: Fact, apps: number): string {
  if (f.desc) return f.desc;
  const conf = CONF_LONG[f.conf] ?? f.conf;
  const appsPhrase = apps ? `, making their ${ordinal(apps)} World Cup appearance` : "";
  let honors: string;
  if ((f.titles ?? 0) > 0) {
    honors = `${f.titles}-time world champions${f.lastTitle ? `, last lifting the trophy in ${f.lastTitle}` : ""}.`;
  } else if (f.best && f.best !== "Debut") {
    honors = `Best World Cup finish: ${f.best}.`;
  } else if (f.best === "Debut") {
    honors = "Making their long-awaited World Cup debut on the sport's biggest stage.";
  } else {
    honors = "Back among the best 48 nations on earth.";
  }
  const lead = f.nick ? `${f.nick} — the ` : "The ";
  return `${lead}${conf} side${appsPhrase}. ${honors}`;
}

(async () => {
  const list = (await (await fetch(`${ESPN}/teams`)).json()).sports[0].leagues[0].teams as any[];

  // ── Player clubs from the Wikipedia squads wikitext ──────────────────
  const norm = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, "").trim();
  const linkText = (raw: string) => {
    const m = raw.trim().match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
    return m ? (m[2] || m[1]).trim() : raw.replace(/[[\]{}]/g, "").trim();
  };
  const fullClub = new Map<string, string>();
  const lastClub = new Map<string, string>();
  const lastCount: Record<string, number> = {};
  try {
    const wt: string = (await (await fetch(
      "https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_squads&prop=wikitext&format=json&formatversion=2",
      { headers: { "User-Agent": "fifa26-dev/1.0" } }
    )).json()).parse?.wikitext ?? "";
    for (const line of wt.split("\n")) {
      if (!/club\s*=/.test(line) || !/name\s*=/.test(line)) continue;
      const nm = line.match(/name\s*=\s*(\[\[.*?\]\]|[^|}\n]+)/);
      const cl = line.match(/club\s*=\s*(\[\[.*?\]\]|[^|}\n]+)/);
      if (!nm || !cl) continue;
      const name = linkText(nm[1]);
      const club = linkText(cl[1]);
      if (!name || !club) continue;
      fullClub.set(norm(name), club);
      const last = norm(name.split(/\s+/).pop() || "");
      lastCount[last] = (lastCount[last] || 0) + 1;
      lastClub.set(last, club);
    }
    console.log(`Parsed ${fullClub.size} player→club entries from Wikipedia.`);
  } catch (e) {
    console.warn("Wikipedia club parse failed, clubs will be blank:", (e as Error).message);
  }
  const clubFor = (espnName: string): string => {
    const nf = norm(espnName);
    if (fullClub.has(nf)) return fullClub.get(nf)!;
    const last = norm(espnName.split(/\s+/).pop() || "");
    if (lastCount[last] === 1) return lastClub.get(last)!;
    return "";
  };

  const profiles: string[] = [];

  for (const code of Object.keys(FACTS)) {
    const f = FACTS[code];
    const teamRow = TEAMS_LIST.find((t) => t.code === code);
    const teamFlag = teamRow?.flag ?? "🏳️";

    // Find the ESPN team by normalized name
    const espnTeam = list.find((x) => {
      const n = normalizeTeamName(x.team.displayName);
      return nameToCode[n] === code || x.team.abbreviation === code;
    });

    let squad: { name: string; number: number; position: string; club: string }[] = [];
    let kitPrimary = "", kitSecondary = "";
    if (espnTeam) {
      kitPrimary = espnTeam.team.color ? `#${espnTeam.team.color}` : "";
      kitSecondary = espnTeam.team.alternateColor ? `#${espnTeam.team.alternateColor}` : "";
      try {
        const d = await (await fetch(`${ESPN}/teams/${espnTeam.team.id}?enable=roster`)).json();
        const athletes = (d.team?.athletes ?? []) as any[];
        squad = athletes.map((a) => ({
          name: a.displayName as string,
          number: parseInt(a.jersey) || 0,
          position: posMap(a.position?.abbreviation ?? ""),
          club: clubFor(a.displayName as string),
        })).sort((p, q) => p.number - q.number);
      } catch { /* leave squad empty */ }
    }

    const apps = f.apps ?? 0;
    const titles = f.titles ?? 0;
    const qualification = HOSTS.has(code) ? "Host nation" : `${f.conf} Qualifying`;
    const desc = buildDesc(code, f, apps).replace(/"/g, '\\"');

    const squadStr = squad.length
      ? squad.map((s) =>
          s.club
            ? `    p(${JSON.stringify(s.name)}, ${s.number}, "${s.position}", ${JSON.stringify(s.club)}),`
            : `    p(${JSON.stringify(s.name)}, ${s.number}, "${s.position}"),`
        ).join("\n")
      : "";

    profiles.push(`  ${code}: {
    code: "${code}",
    logo: "/logos/${code.toLowerCase()}.png",
    flag: ${JSON.stringify(teamFlag)},
    fifaRanking: ${rankOf[code] ?? 0},
    confederation: "${f.conf}",
    coach: ${JSON.stringify(f.coach ?? "")},
    captain: ${JSON.stringify(f.capt ?? "")},
    starPlayer: ${JSON.stringify(f.star ?? "")},
    nickname: ${JSON.stringify(f.nick ?? "")},
    homeStadium: ${JSON.stringify(f.stadium ?? "")},
    qualification: ${JSON.stringify(qualification)},
    kitPrimary: ${JSON.stringify(kitPrimary)},
    kitSecondary: ${JSON.stringify(kitSecondary)},
    worldCupAppearances: ${apps},
    titles: ${titles},
    bestFinish: ${JSON.stringify(f.best ?? "—")},
    description: "${desc}",
    squad: [
${squadStr}
    ],
  },`);
  }

  const header = `// team-profiles.ts — AUTO-GENERATED (scripts/gen-profiles.ts)
// Squads + kit colours: ESPN. Facts: curated historical record + verified staff.

export type Position = "GK" | "DF" | "MF" | "FW";

export const POSITION_LABELS: Record<Position, string> = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};

export const POSITION_ORDER: Position[] = ["GK", "DF", "MF", "FW"];

export interface Player {
  name: string;
  number: number;
  position: Position;
  club?: string;
}

export interface TeamProfile {
  code: string;
  logo: string;
  flag: string;
  fifaRanking: number;
  confederation: string;
  coach: string;
  captain: string;
  starPlayer?: string;
  nickname?: string;
  homeStadium?: string;
  qualification?: string;
  kitPrimary?: string;
  kitSecondary?: string;
  worldCupAppearances: number;
  titles: number;
  bestFinish: string;
  description: string;
  squad: Player[];
}

const p = (name: string, number: number, position: Position, club = ""): Player =>
  ({ name, number, position, club });

export const TEAM_PROFILES: Record<string, TeamProfile> = {
`;

  const footer = `};

/** Get a team profile by code, returns null if not found */
export function getTeamProfile(code: string): TeamProfile | null {
  return TEAM_PROFILES[code] ?? null;
}

/** Group a squad by position, in display order */
export function groupSquadByPosition(squad: Player[]): { position: Position; label: string; players: Player[] }[] {
  return POSITION_ORDER
    .map((pos) => ({
      position: pos,
      label: POSITION_LABELS[pos],
      players: squad.filter((pl) => pl.position === pos),
    }))
    .filter((group) => group.players.length > 0);
}
`;

  writeFileSync("src/lib/data/team-profiles.ts", header + profiles.join("\n") + "\n" + footer);
  console.log(`Wrote ${profiles.length} profiles.`);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
