// team-profiles.ts — Team identity, staff, stats, and squads
// Squads are representative V1 data. Architecture supports full 26-man
// squads per team; teams without data fall back gracefully in the UI.

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
  club: string;
}

export interface TeamProfile {
  code: string;
  logo: string;
  flag: string;
  fifaRanking: number;
  confederation: string;
  coach: string;
  captain: string;
  worldCupAppearances: number;
  titles: number;
  bestFinish: string;
  description: string;
  squad: Player[];
}

const p = (name: string, number: number, position: Position, club: string): Player =>
  ({ name, number, position, club });

export const TEAM_PROFILES: Record<string, TeamProfile> = {
  ARG: {
    code: "ARG",
    logo: "/logos/ARG.png",
    flag: "🇦🇷",
    fifaRanking: 1,
    confederation: "CONMEBOL",
    coach: "Lionel Scaloni",
    captain: "Lionel Messi",
    worldCupAppearances: 18,
    titles: 3,
    bestFinish: "Champions (1978, 1986, 2022)",
    description:
      "The reigning world champions arrive in North America chasing back-to-back titles — something no nation has achieved since Brazil in 1962.",
    squad: [
      p("Emiliano Martínez", 23, "GK", "Aston Villa"),
      p("Gerónimo Rulli", 12, "GK", "Marseille"),
      p("Cristian Romero", 13, "DF", "Tottenham Hotspur"),
      p("Lisandro Martínez", 25, "DF", "Manchester United"),
      p("Nicolás Otamendi", 19, "DF", "Benfica"),
      p("Nahuel Molina", 26, "DF", "Atlético Madrid"),
      p("Nicolás Tagliafico", 3, "DF", "Lyon"),
      p("Rodrigo De Paul", 7, "MF", "Atlético Madrid"),
      p("Enzo Fernández", 24, "MF", "Chelsea"),
      p("Alexis Mac Allister", 20, "MF", "Liverpool"),
      p("Leandro Paredes", 5, "MF", "Roma"),
      p("Lionel Messi", 10, "FW", "Inter Miami"),
      p("Julián Álvarez", 9, "FW", "Atlético Madrid"),
      p("Lautaro Martínez", 22, "FW", "Inter Milan"),
      p("Ángel Di María", 11, "FW", "Benfica"),
    ],
  },

  FRA: {
    code: "FRA",
    logo: "/logos/FRA.png",
    flag: "🇫🇷",
    fifaRanking: 2,
    confederation: "UEFA",
    coach: "Didier Deschamps",
    captain: "Kylian Mbappé",
    worldCupAppearances: 16,
    titles: 2,
    bestFinish: "Champions (1998, 2018)",
    description:
      "Finalists in two of the last three World Cups, Les Bleus bring the deepest talent pool in world football — and unfinished business from Qatar.",
    squad: [
      p("Mike Maignan", 16, "GK", "AC Milan"),
      p("Brice Samba", 23, "GK", "Rennes"),
      p("William Saliba", 17, "DF", "Arsenal"),
      p("Ibrahima Konaté", 5, "DF", "Liverpool"),
      p("Dayot Upamecano", 4, "DF", "Bayern Munich"),
      p("Jules Koundé", 3, "DF", "Barcelona"),
      p("Theo Hernández", 22, "DF", "AC Milan"),
      p("Aurélien Tchouaméni", 8, "MF", "Real Madrid"),
      p("Eduardo Camavinga", 6, "MF", "Real Madrid"),
      p("Adrien Rabiot", 14, "MF", "Marseille"),
      p("Antoine Griezmann", 7, "MF", "Atlético Madrid"),
      p("Kylian Mbappé", 10, "FW", "Real Madrid"),
      p("Ousmane Dembélé", 11, "FW", "Paris Saint-Germain"),
      p("Marcus Thuram", 15, "FW", "Inter Milan"),
      p("Randal Kolo Muani", 12, "FW", "Paris Saint-Germain"),
    ],
  },

  BRA: {
    code: "BRA",
    logo: "/logos/BRA.png",
    flag: "🇧🇷",
    fifaRanking: 5,
    confederation: "CONMEBOL",
    coach: "Carlo Ancelotti",
    captain: "Marquinhos",
    worldCupAppearances: 22,
    titles: 5,
    bestFinish: "Champions (1958, 1962, 1970, 1994, 2002)",
    description:
      "The only nation to appear at every World Cup. Five stars on the shirt, and a generation determined to add a sixth.",
    squad: [
      p("Alisson Becker", 1, "GK", "Liverpool"),
      p("Ederson", 23, "GK", "Manchester City"),
      p("Marquinhos", 4, "DF", "Paris Saint-Germain"),
      p("Gabriel Magalhães", 6, "DF", "Arsenal"),
      p("Éder Militão", 3, "DF", "Real Madrid"),
      p("Danilo", 2, "DF", "Flamengo"),
      p("Wendell", 16, "DF", "Porto"),
      p("Casemiro", 5, "MF", "Manchester United"),
      p("Bruno Guimarães", 8, "MF", "Newcastle United"),
      p("Lucas Paquetá", 7, "MF", "West Ham United"),
      p("Vinícius Júnior", 10, "FW", "Real Madrid"),
      p("Rodrygo", 11, "FW", "Real Madrid"),
      p("Raphinha", 19, "FW", "Barcelona"),
      p("Endrick", 9, "FW", "Real Madrid"),
    ],
  },

  ENG: {
    code: "ENG",
    logo: "/logos/ENG.png",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    fifaRanking: 3,
    confederation: "UEFA",
    coach: "Thomas Tuchel",
    captain: "Harry Kane",
    worldCupAppearances: 16,
    titles: 1,
    bestFinish: "Champions (1966)",
    description:
      "Sixty years since their only World Cup triumph. A golden generation with a point to prove on the biggest stage in North America.",
    squad: [
      p("Jordan Pickford", 1, "GK", "Everton"),
      p("Dean Henderson", 23, "GK", "Crystal Palace"),
      p("John Stones", 5, "DF", "Manchester City"),
      p("Marc Guéhi", 6, "DF", "Crystal Palace"),
      p("Kyle Walker", 2, "DF", "Manchester City"),
      p("Trent Alexander-Arnold", 18, "DF", "Liverpool"),
      p("Luke Shaw", 3, "DF", "Manchester United"),
      p("Declan Rice", 4, "MF", "Arsenal"),
      p("Jude Bellingham", 10, "MF", "Real Madrid"),
      p("Phil Foden", 20, "MF", "Manchester City"),
      p("Kobbie Mainoo", 8, "MF", "Manchester United"),
      p("Harry Kane", 9, "FW", "Bayern Munich"),
      p("Bukayo Saka", 7, "FW", "Arsenal"),
      p("Cole Palmer", 11, "FW", "Chelsea"),
    ],
  },

  ESP: {
    code: "ESP",
    logo: "/logos/ESP.png",
    flag: "🇪🇸",
    fifaRanking: 8,
    confederation: "UEFA",
    coach: "Luis de la Fuente",
    captain: "Álvaro Morata",
    worldCupAppearances: 16,
    titles: 1,
    bestFinish: "Champions (2010)",
    description:
      "The reigning European champions bring the youngest, most exciting squad in the tournament. Spain's new golden age is here.",
    squad: [
      p("Unai Simón", 23, "GK", "Athletic Bilbao"),
      p("David Raya", 13, "GK", "Arsenal"),
      p("Dani Carvajal", 2, "DF", "Real Madrid"),
      p("Aymeric Laporte", 3, "DF", "Al-Nassr"),
      p("Robin Le Normand", 24, "DF", "Atlético Madrid"),
      p("Marc Cucurella", 14, "DF", "Chelsea"),
      p("Pedri", 8, "MF", "Barcelona"),
      p("Gavi", 6, "MF", "Barcelona"),
      p("Rodri", 16, "MF", "Manchester City"),
      p("Dani Olmo", 10, "MF", "Barcelona"),
      p("Lamine Yamal", 19, "FW", "Barcelona"),
      p("Nico Williams", 11, "FW", "Athletic Bilbao"),
      p("Álvaro Morata", 7, "FW", "AC Milan"),
    ],
  },

  GER: {
    code: "GER",
    logo: "/logos/GER.png",
    flag: "🇩🇪",
    fifaRanking: 16,
    confederation: "UEFA",
    coach: "Julian Nagelsmann",
    captain: "Joshua Kimmich",
    worldCupAppearances: 20,
    titles: 4,
    bestFinish: "Champions (1954, 1974, 1990, 2014)",
    description:
      "Four-time champions in the midst of a generational rebuild. Germany's young core gained confidence at their home Euros — now comes the World Cup.",
    squad: [
      p("Manuel Neuer", 1, "GK", "Bayern Munich"),
      p("Marc-André ter Stegen", 22, "GK", "Barcelona"),
      p("Antonio Rüdiger", 2, "DF", "Real Madrid"),
      p("Jonathan Tah", 4, "DF", "Bayer Leverkusen"),
      p("David Raum", 3, "DF", "RB Leipzig"),
      p("Joshua Kimmich", 6, "DF", "Bayern Munich"),
      p("İlkay Gündoğan", 8, "MF", "Barcelona"),
      p("Jamal Musiala", 10, "MF", "Bayern Munich"),
      p("Florian Wirtz", 17, "MF", "Bayer Leverkusen"),
      p("Toni Kroos", 14, "MF", "Retired"),
      p("Kai Havertz", 7, "FW", "Arsenal"),
      p("Leroy Sané", 19, "FW", "Bayern Munich"),
      p("Niclas Füllkrug", 9, "FW", "West Ham United"),
    ],
  },

  POR: {
    code: "POR",
    logo: "/logos/POR.png",
    flag: "🇵🇹",
    fifaRanking: 7,
    confederation: "UEFA",
    coach: "Roberto Martínez",
    captain: "Cristiano Ronaldo",
    worldCupAppearances: 8,
    titles: 0,
    bestFinish: "Third Place (1966)",
    description:
      "Cristiano Ronaldo's last dance on the World Cup stage. A squad balancing legacy with a new generation of extraordinary talent.",
    squad: [
      p("Diogo Costa", 22, "GK", "Porto"),
      p("Rui Patrício", 1, "GK", "Roma"),
      p("Rúben Dias", 4, "DF", "Manchester City"),
      p("Pepe", 3, "DF", "Porto"),
      p("Nuno Mendes", 19, "DF", "Paris Saint-Germain"),
      p("João Cancelo", 20, "DF", "Barcelona"),
      p("Bruno Fernandes", 8, "MF", "Manchester United"),
      p("Bernardo Silva", 10, "MF", "Manchester City"),
      p("Vitinha", 14, "MF", "Paris Saint-Germain"),
      p("Cristiano Ronaldo", 7, "FW", "Al-Nassr"),
      p("Rafael Leão", 17, "FW", "AC Milan"),
      p("Gonçalo Ramos", 9, "FW", "Paris Saint-Germain"),
    ],
  },

  NED: {
    code: "NED",
    logo: "/logos/NED.png",
    flag: "🇳🇱",
    fifaRanking: 6,
    confederation: "UEFA",
    coach: "Ronald Koeman",
    captain: "Virgil van Dijk",
    worldCupAppearances: 11,
    titles: 0,
    bestFinish: "Runners-up (1974, 1978, 2010)",
    description:
      "Three World Cup finals, zero trophies. The Netherlands bring Total Football's legacy and an unwavering belief that this time will be different.",
    squad: [
      p("Bart Verbruggen", 13, "GK", "Brighton"),
      p("Mark Flekken", 23, "GK", "Brentford"),
      p("Virgil van Dijk", 4, "DF", "Liverpool"),
      p("Nathan Aké", 5, "DF", "Manchester City"),
      p("Jurriën Timber", 2, "DF", "Arsenal"),
      p("Denzel Dumfries", 22, "DF", "Inter Milan"),
      p("Frenkie de Jong", 21, "MF", "Barcelona"),
      p("Ryan Gravenberch", 8, "MF", "Liverpool"),
      p("Xavi Simons", 10, "MF", "RB Leipzig"),
      p("Cody Gakpo", 11, "FW", "Liverpool"),
      p("Memphis Depay", 9, "FW", "Atlético Madrid"),
    ],
  },

  USA: {
    code: "USA",
    logo: "/logos/USA.png",
    flag: "🇺🇸",
    fifaRanking: 11,
    confederation: "CONCACAF",
    coach: "Mauricio Pochettino",
    captain: "Christian Pulisic",
    worldCupAppearances: 11,
    titles: 0,
    bestFinish: "Third Place (1930)",
    description:
      "The co-hosts. A young, hungry squad playing on home soil with a nation watching. This is American soccer's defining moment.",
    squad: [
      p("Matt Turner", 1, "GK", "Nottingham Forest"),
      p("Ethan Horvath", 18, "GK", "Cardiff City"),
      p("Sergiño Dest", 2, "DF", "PSV Eindhoven"),
      p("Chris Richards", 15, "DF", "Crystal Palace"),
      p("Tim Ream", 13, "DF", "Fulham"),
      p("Antonee Robinson", 5, "DF", "Fulham"),
      p("Tyler Adams", 4, "MF", "Bournemouth"),
      p("Weston McKennie", 8, "MF", "Juventus"),
      p("Yunus Musah", 6, "MF", "AC Milan"),
      p("Giovanni Reyna", 7, "MF", "Borussia Dortmund"),
      p("Christian Pulisic", 10, "FW", "AC Milan"),
      p("Timothy Weah", 11, "FW", "Juventus"),
      p("Folarin Balogun", 20, "FW", "Monaco"),
    ],
  },

  MEX: {
    code: "MEX",
    logo: "/logos/MEX.png",
    flag: "🇲🇽",
    fifaRanking: 15,
    confederation: "CONCACAF",
    coach: "Javier Aguirre",
    captain: "Edson Álvarez",
    worldCupAppearances: 17,
    titles: 0,
    bestFinish: "Quarter-finals (1970, 1986)",
    description:
      "Co-hosts with the weight of a nation. Mexico have never advanced past the quarter-finals — the Azteca will be thundering for them to break the curse.",
    squad: [
      p("Guillermo Ochoa", 13, "GK", "Salernitana"),
      p("Luis Malagón", 23, "GK", "América"),
      p("Jorge Sánchez", 4, "DF", "Cruz Azul"),
      p("César Montes", 3, "DF", "Almería"),
      p("Jesús Gallardo", 6, "DF", "Monterrey"),
      p("Johan Vásquez", 5, "DF", "Genoa"),
      p("Edson Álvarez", 14, "MF", "West Ham United"),
      p("Luis Chávez", 18, "MF", "Pachuca"),
      p("Carlos Rodríguez", 8, "MF", "Cruz Azul"),
      p("Hirving Lozano", 22, "FW", "PSV Eindhoven"),
      p("Santiago Giménez", 9, "FW", "Feyenoord"),
      p("Alexis Vega", 10, "FW", "Toluca"),
    ],
  },

  CAN: {
    code: "CAN",
    logo: "/logos/CAN.png",
    flag: "🇨🇦",
    fifaRanking: 48,
    confederation: "CONCACAF",
    coach: "Jesse Marsch",
    captain: "Alphonso Davies",
    worldCupAppearances: 3,
    titles: 0,
    bestFinish: "Group Stage (1986, 2022)",
    description:
      "Co-hosts on a meteoric rise. Canada's golden generation, led by Alphonso Davies, aim to write history on home turf.",
    squad: [
      p("Milan Borjan", 18, "GK", "Red Star Belgrade"),
      p("Maxime Crépeau", 16, "GK", "Portland Timbers"),
      p("Alphonso Davies", 19, "DF", "Bayern Munich"),
      p("Alistair Johnston", 2, "DF", "Celtic"),
      p("Kamal Miller", 4, "DF", "Portland Timbers"),
      p("Richie Laryea", 22, "DF", "Toronto FC"),
      p("Stephen Eustáquio", 7, "MF", "Porto"),
      p("Ismaël Koné", 8, "MF", "Marseille"),
      p("Tajon Buchanan", 11, "MF", "Club Brugge"),
      p("Jonathan David", 20, "FW", "Lille"),
      p("Cyle Larin", 17, "FW", "Real Valladolid"),
      p("Jonathan Osorio", 21, "FW", "Toronto FC"),
    ],
  },

  URU: {
    code: "URU",
    logo: "/logos/URU.png",
    flag: "🇺🇾",
    fifaRanking: 11,
    confederation: "CONMEBOL",
    coach: "Marcelo Bielsa",
    captain: "Federico Valverde",
    worldCupAppearances: 14,
    titles: 2,
    bestFinish: "Champions (1930, 1950)",
    description:
      "The original World Cup winners. Uruguay's fierce identity and tactical intelligence make them perennial dark horses.",
    squad: [
      p("Sergio Rochet", 1, "GK", "Inter de Porto Alegre"),
      p("Santiago Mele", 23, "GK", "Godoy Cruz"),
      p("José María Giménez", 2, "DF", "Atlético Madrid"),
      p("Ronald Araújo", 4, "DF", "Barcelona"),
      p("Mathías Olivera", 16, "DF", "Napoli"),
      p("Nahitan Nández", 8, "MF", "Al-Majmaah"),
      p("Federico Valverde", 15, "MF", "Real Madrid"),
      p("Rodrigo Bentancur", 6, "MF", "Tottenham Hotspur"),
      p("Manuel Ugarte", 5, "MF", "Paris Saint-Germain"),
      p("Darwin Núñez", 11, "FW", "Liverpool"),
      p("Luis Suárez", 9, "FW", "Inter Miami"),
      p("Facundo Pellistri", 22, "FW", "Manchester United"),
    ],
  },

  COL: {
    code: "COL",
    logo: "/logos/COL.png",
    flag: "🇨🇴",
    fifaRanking: 14,
    confederation: "CONMEBOL",
    coach: "Néstor Lorenzo",
    captain: "James Rodríguez",
    worldCupAppearances: 7,
    titles: 0,
    bestFinish: "Quarter-finals (2014)",
    description:
      "Colombia's creative flair and relentless pressing made them Copa América finalists. They arrive with belief and a squad deep in attacking talent.",
    squad: [
      p("David Ospina", 1, "GK", "Al-Nassr"),
      p("Camilo Vargas", 12, "GK", "Atlas"),
      p("Davinson Sánchez", 23, "DF", "Galatasaray"),
      p("Yerry Mina", 13, "DF", "Cagliari"),
      p("Daniel Muñoz", 4, "DF", "Crystal Palace"),
      p("Johan Mojica", 3, "DF", "Real Mallorca"),
      p("James Rodríguez", 10, "MF", "São Paulo"),
      p("Jefferson Lerma", 16, "MF", "Crystal Palace"),
      p("Richard Ríos", 6, "MF", "Palmeiras"),
      p("Jhon Arias", 14, "MF", "Fluminense"),
      p("Luis Díaz", 7, "FW", "Liverpool"),
      p("Rafael Santos Borré", 9, "FW", "Internacional"),
    ],
  },

  MAR: {
    code: "MAR",
    logo: "/logos/MAR.png",
    flag: "🇲🇦",
    fifaRanking: 12,
    confederation: "CAF",
    coach: "Walid Regragui",
    captain: "Romain Saïss",
    worldCupAppearances: 7,
    titles: 0,
    bestFinish: "Semi-finals (2022)",
    description:
      "The Atlas Lions shattered barriers in Qatar, becoming the first African nation to reach a World Cup semi-final. They return with unfinished business.",
    squad: [
      p("Yassine Bounou", 1, "GK", "Al-Hilal"),
      p("Munir El Kajoui", 12, "GK", "RS Berkane"),
      p("Achraf Hakimi", 2, "DF", "Paris Saint-Germain"),
      p("Nayef Aguerd", 5, "DF", "West Ham United"),
      p("Romain Saïss", 6, "DF", "Besiktas"),
      p("Noussair Mazraoui", 3, "DF", "Bayern Munich"),
      p("Sofyan Amrabat", 4, "MF", "Fiorentina"),
      p("Azzedine Ounahi", 8, "MF", "Marseille"),
      p("Hakim Ziyech", 7, "MF", "Galatasaray"),
      p("Youssef En-Nesyri", 19, "FW", "Sevilla"),
      p("Abdelhamid Sabiri", 23, "FW", "Sampdoria"),
    ],
  },

  JPN: {
    code: "JPN",
    logo: "/logos/JPN.png",
    flag: "🇯🇵",
    fifaRanking: 18,
    confederation: "AFC",
    coach: "Hajime Moriyasu",
    captain: "Wataru Endo",
    worldCupAppearances: 7,
    titles: 0,
    bestFinish: "Round of 16 (2002, 2022)",
    description:
      "The Samurai Blue have become giant-killers — beating Germany and Spain in Qatar. Now they want to go deeper. An Asian powerhouse with European pedigree.",
    squad: [
      p("Shūichi Gonda", 12, "GK", "Shimizu S-Pulse"),
      p("Daniel Schmidt", 1, "GK", "Sint-Truiden"),
      p("Ko Itakura", 22, "DF", "Borussia Mönchengladbach"),
      p("Takehiro Tomiyasu", 16, "DF", "Arsenal"),
      p("Yuto Nagatomo", 5, "DF", "FC Tokyo"),
      p("Wataru Endo", 6, "MF", "Liverpool"),
      p("Hidemasa Morita", 8, "MF", "Sporting CP"),
      p("Takefusa Kubo", 11, "MF", "Real Sociedad"),
      p("Ritsu Dōan", 14, "MF", "Freiburg"),
      p("Kaoru Mitoma", 9, "FW", "Brighton"),
      p("Daichi Kamada", 15, "FW", "Crystal Palace"),
    ],
  },

  SEN: {
    code: "SEN",
    logo: "/logos/SEN.png",
    flag: "🇸🇳",
    fifaRanking: 17,
    confederation: "CAF",
    coach: "Aliou Cissé",
    captain: "Kalidou Koulibaly",
    worldCupAppearances: 4,
    titles: 0,
    bestFinish: "Quarter-finals (2002)",
    description:
      "Africa Cup of Nations champions. The Lions of Teranga combine pace, physicality, and technical brilliance into one of the continent's most dangerous squads.",
    squad: [
      p("Édouard Mendy", 16, "GK", "Al-Ahli"),
      p("Seny Dieng", 1, "GK", "Middlesbrough"),
      p("Kalidou Koulibaly", 3, "DF", "Al-Hilal"),
      p("Abdou Diallo", 22, "DF", "Al-Arabi"),
      p("Youssouf Sabaly", 2, "DF", "Real Betis"),
      p("Pape Matar Sarr", 8, "MF", "Tottenham Hotspur"),
      p("Nampalys Mendy", 6, "MF", "RC Lens"),
      p("Idrissa Gueye", 5, "MF", "Everton"),
      p("Sadio Mané", 10, "FW", "Al-Nassr"),
      p("Ismaïla Sarr", 18, "FW", "Marseille"),
      p("Nicolas Jackson", 9, "FW", "Chelsea"),
    ],
  },

  BEL: {
    code: "BEL",
    logo: "/logos/BEL.png",
    flag: "🇧🇪",
    fifaRanking: 4,
    confederation: "UEFA",
    coach: "Domenico Tedesco",
    captain: "Kevin De Bruyne",
    worldCupAppearances: 14,
    titles: 0,
    bestFinish: "Third Place (2018)",
    description:
      "Belgium's golden generation is entering its twilight. De Bruyne, Courtois, Lukaku — their last chance to convert world-class talent into a World Cup trophy.",
    squad: [
      p("Thibaut Courtois", 1, "GK", "Real Madrid"),
      p("Koen Casteels", 13, "GK", "Wolfsburg"),
      p("Jan Vertonghen", 5, "DF", "Anderlecht"),
      p("Arthur Theate", 4, "DF", "Rennes"),
      p("Timothy Castagne", 21, "DF", "Fulham"),
      p("Kevin De Bruyne", 7, "MF", "Manchester City"),
      p("Youri Tielemans", 8, "MF", "Aston Villa"),
      p("Amadou Onana", 6, "MF", "Everton"),
      p("Romelu Lukaku", 9, "FW", "Roma"),
      p("Jérémy Doku", 11, "FW", "Manchester City"),
      p("Leandro Trossard", 14, "FW", "Arsenal"),
    ],
  },

  CRO: {
    code: "CRO",
    logo: "/logos/CRO.png",
    flag: "🇭🇷",
    fifaRanking: 10,
    confederation: "UEFA",
    coach: "Zlatko Dalić",
    captain: "Luka Modrić",
    worldCupAppearances: 7,
    titles: 0,
    bestFinish: "Runners-up (2018)",
    description:
      "Finalists in 2018, third place in 2022. Luka Modrić's farewell tour — and a nation of four million that refuses to accept its size as a limitation.",
    squad: [
      p("Dominik Livaković", 23, "GK", "Fenerbahçe"),
      p("Ivica Ivušić", 1, "GK", "Pafos"),
      p("Joško Gvardiol", 20, "DF", "Manchester City"),
      p("Duje Ćaleta-Car", 3, "DF", "Lyon"),
      p("Josip Stanišić", 2, "DF", "Bayer Leverkusen"),
      p("Borna Sosa", 19, "DF", "Ajax"),
      p("Luka Modrić", 10, "MF", "Real Madrid"),
      p("Mateo Kovačić", 8, "MF", "Manchester City"),
      p("Marcelo Brozović", 11, "MF", "Al-Nassr"),
      p("Lovro Majer", 7, "MF", "Wolfsburg"),
      p("Ivan Perišić", 4, "FW", "Hajduk Split"),
      p("Andrej Kramarić", 9, "FW", "Hoffenheim"),
    ],
  },
};

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
      players: squad.filter((p) => p.position === pos),
    }))
    .filter((group) => group.players.length > 0);
}
