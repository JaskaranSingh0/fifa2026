export interface TeamBranding {
  primary: string;
  secondary: string;
}

export const TEAM_BRANDING: Record<string, TeamBranding> = {
  ARG: { primary: "#75AADB", secondary: "#FFFFFF" },
  FRA: { primary: "#002395", secondary: "#ED2939" },
  BRA: { primary: "#009C3B", secondary: "#FFDF00" },
  ENG: { primary: "#CE1124", secondary: "#FFFFFF" },
  ESP: { primary: "#AA151B", secondary: "#F1BF00" },
  GER: { primary: "#000000", secondary: "#DD0000" }, // Black/Red
  POR: { primary: "#FF0000", secondary: "#006600" },
  NED: { primary: "#F36C21", secondary: "#1E1E1E" },
  USA: { primary: "#002868", secondary: "#BF0A30" },
  MEX: { primary: "#006341", secondary: "#FFFFFF" },
  CAN: { primary: "#FF0000", secondary: "#FFFFFF" },
  URU: { primary: "#55B5E5", secondary: "#FDB813" },
  COL: { primary: "#FCD116", secondary: "#003893" },
  MAR: { primary: "#C1272D", secondary: "#006233" },
  JPN: { primary: "#000555", secondary: "#FFFFFF" },
  SEN: { primary: "#00853F", secondary: "#FDEF42" },
  BEL: { primary: "#E30613", secondary: "#FFD200" },
  CRO: { primary: "#FF0000", secondary: "#FFFFFF" },
  
  // 30 additional teams to reach 48
  ITA: { primary: "#0066B2", secondary: "#FFFFFF" }, // Italy
  SUI: { primary: "#D52B1E", secondary: "#FFFFFF" }, // Switzerland
  DEN: { primary: "#C60C30", secondary: "#FFFFFF" }, // Denmark
  SWE: { primary: "#004B87", secondary: "#FFCD00" }, // Sweden
  NOR: { primary: "#BA0C2F", secondary: "#00205B" }, // Norway
  SRB: { primary: "#C6363C", secondary: "#0C4076" }, // Serbia
  POL: { primary: "#DC143C", secondary: "#FFFFFF" }, // Poland
  WAL: { primary: "#D30731", secondary: "#002B54" }, // Wales
  SCO: { primary: "#004B84", secondary: "#FFFFFF" }, // Scotland
  KOR: { primary: "#034EA2", secondary: "#C60C30" }, // South Korea
  AUS: { primary: "#FFCD00", secondary: "#008751" }, // Australia
  KSA: { primary: "#006C35", secondary: "#FFFFFF" }, // Saudi Arabia
  IRN: { primary: "#239F40", secondary: "#DA0000" }, // Iran
  QAT: { primary: "#8A1538", secondary: "#FFFFFF" }, // Qatar
  NGA: { primary: "#008751", secondary: "#FFFFFF" }, // Nigeria
  GHA: { primary: "#CE1126", secondary: "#FCD116" }, // Ghana
  CMR: { primary: "#007A5E", secondary: "#CE1126" }, // Cameroon
  EGY: { primary: "#CE1126", secondary: "#000000" }, // Egypt
  CIV: { primary: "#F77F00", secondary: "#009E60" }, // Ivory Coast
  ECU: { primary: "#FFD100", secondary: "#00205B" }, // Ecuador
  CHI: { primary: "#DA291C", secondary: "#0033A0" }, // Chile
  PER: { primary: "#D91023", secondary: "#FFFFFF" }, // Peru
  VEN: { primary: "#8A1538", secondary: "#FCD116" }, // Venezuela
  CRC: { primary: "#CE1126", secondary: "#002B5E" }, // Costa Rica
  PAN: { primary: "#DA291C", secondary: "#00205B" }, // Panama
  JAM: { primary: "#009B3A", secondary: "#FED100" }, // Jamaica
  NZL: { primary: "#000000", secondary: "#FFFFFF" }, // New Zealand
  TUN: { primary: "#E70013", secondary: "#FFFFFF" }, // Tunisia
  DZA: { primary: "#006233", secondary: "#D21034" }, // Algeria
  MLI: { primary: "#14B53A", secondary: "#FCD116" }, // Mali
};

export function getTeamBranding(code: string): TeamBranding {
  return TEAM_BRANDING[code] ?? { primary: "#FFFFFF", secondary: "#AAAAAA" };
}
