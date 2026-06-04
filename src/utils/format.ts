export function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function formatDamage(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'Unknown';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value?: number, suffix = ''): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'Unknown';
  return `${new Intl.NumberFormat('en-US').format(value)}${suffix}`;
}
