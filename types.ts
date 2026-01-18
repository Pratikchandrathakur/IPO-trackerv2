export enum IPOStatus {
  OPEN = "OPEN",
  COMING_SOON = "COMING_SOON",
  CLOSED = "CLOSED",
  LISTED = "LISTED"
}

export interface IPOData {
  companyName: string;
  sector: string;
  units: number;
  price: number;
  openingDate: string;
  closingDate: string;
  status: IPOStatus;
  description: string;
  sourceUrl?: string;
  // Extended Details
  shareType: string; // e.g. "General Public", "Foreign Employment", "Locals", "Mutual Fund"
  minUnits?: number;
  maxUnits?: number;
  rating?: string; // e.g., "ICRA NP Double B"
  projectDescription?: string; // History/Background
  risks?: string; // Risk factors
}

export interface Subscriber {
  id?: number;
  email: string;
  created_at?: string;
}

export interface ScanResult {
  ipos: IPOData[];
  lastUpdated: string;
  newsSummary: string;
}