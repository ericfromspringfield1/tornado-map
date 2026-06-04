const RATING_ORDER = ['UNKNOWN', 'F0', 'EF0', 'F1', 'EF1', 'F2', 'EF2', 'F3', 'EF3', 'F4', 'EF4', 'F5', 'EF5'];
const STRENGTH: Record<string, number> = {
  UNKNOWN: -1,
  F0: 0,
  EF0: 0,
  F1: 1,
  EF1: 1,
  F2: 2,
  EF2: 2,
  F3: 3,
  EF3: 3,
  F4: 4,
  EF4: 4,
  F5: 5,
  EF5: 5,
};

export const STANDARD_RATINGS = ['EF0', 'EF1', 'EF2', 'EF3', 'EF4', 'EF5', 'F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'UNKNOWN'];

export function normalizeRating(value: unknown): string | undefined {
  if (value === undefined || value === null) return 'UNKNOWN';
  const raw = String(value).trim().toUpperCase();
  if (!raw || ['UNK', 'UNKNOWN', 'UNRATED', 'NA', 'N/A', '-9', '-'].includes(raw)) return 'UNKNOWN';
  if (/^[EF]?F?[0-5]$/.test(raw)) {
    const digit = raw.match(/[0-5]/)?.[0];
    if (!digit) return 'UNKNOWN';
    return raw.startsWith('F') ? `F${digit}` : `EF${digit}`;
  }
  if (/^EF[0-5]$/.test(raw) || /^F[0-5]$/.test(raw)) return raw;
  return 'UNKNOWN';
}

export function getRatingStrength(rating?: string): number {
  return STRENGTH[normalizeRating(rating) ?? 'UNKNOWN'] ?? -1;
}

export function compareRatings(a?: string, b?: string): number {
  return getRatingStrength(a) - getRatingStrength(b);
}

export function getRatingColor(rating?: string): string {
  switch (getRatingStrength(rating)) {
    case 0:
      return '#8ecae6';
    case 1:
      return '#55a630';
    case 2:
      return '#f9c74f';
    case 3:
      return '#f9844a';
    case 4:
      return '#e63946';
    case 5:
      return '#7209b7';
    default:
      return '#6b7280';
  }
}

export function getRatingWeight(rating?: string): number {
  return Math.max(2, getRatingStrength(rating) + 3);
}

export function sortRatings(ratings: string[]): string[] {
  return [...ratings].sort((a, b) => RATING_ORDER.indexOf(a) - RATING_ORDER.indexOf(b));
}
