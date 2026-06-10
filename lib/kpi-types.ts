export interface GHAdvisory {
  id: string;
  cveId: string | null;
  summary: string;
  severity: string;
  publishedAt: string;
  cvssScore: number | null;
  ecosystem: string;
  packageName: string;
}

export interface MSRCRelease {
  id: string;
  title: string;
  releaseDate: string;
  totalCVEs: number;
  critical: number;
  important: number;
  moderate: number;
}

export interface CloudflareData {
  rpkiValidPct: number;
  rpkiInvalidPct: number;
  ddosTrend: number[];
}

export interface SicherheitstachoData {
  attacksLastHour: number;
  topPort: number;
  topProtocol: string;
  topSourceCountry: string;
}
