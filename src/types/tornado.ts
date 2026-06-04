export type TornadoEvent = {
  id: string;
  date: string;
  year: number;
  month: number;
  day: number;
  time?: string;
  state: string;
  county?: string;
  counties?: string[];
  rating?: string;
  fatalities?: number;
  injuries?: number;
  propertyDamage?: number;
  cropDamage?: number;
  pathLengthMiles?: number;
  pathWidthYards?: number;
  startLat?: number;
  startLon?: number;
  endLat?: number;
  endLon?: number;
  remarks?: string;
  source?: string;
  outbreakId?: string;
  outbreakName?: string;
};

export type TornadoFilters = {
  ratings: string[];
  states: string[];
  counties: string[];
  startDate: string;
  endDate: string;
  minYear?: number;
  maxYear?: number;
  months: number[];
  minFatalities?: number;
  minInjuries?: number;
  fatalOnly: boolean;
  minPathLength?: number;
  maxPathLength?: number;
  minPathWidth?: number;
  maxPathWidth?: number;
  minPropertyDamage?: number;
  query: string;
  outbreakIds: string[];
};

export type TornadoSummary = {
  total: number;
  dateRange?: { start: string; end: string };
  fatalTornadoes: number;
  totalFatalities: number;
  totalInjuries: number;
  strongestRating?: string;
  topStates: Array<{ name: string; count: number }>;
  topCounties: Array<{ name: string; count: number }>;
};

export type SelectOption = {
  value: string;
  label: string;
  count?: number;
};
