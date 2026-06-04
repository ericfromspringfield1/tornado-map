import { getRatingColor, getRatingWeight, STANDARD_RATINGS } from '../utils/ratings';

export function Legend() {
  const ratings = ['UNKNOWN', ...STANDARD_RATINGS.filter((rating) => rating.startsWith('EF'))];
  return (
    <div className="absolute bottom-4 right-4 z-[500] rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur" aria-label="Map legend">
      <h3 className="mb-2 font-bold text-slate-800">Rating intensity</h3>
      <div className="space-y-1">
        {ratings.map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="inline-block rounded-full border border-white shadow" style={{ backgroundColor: getRatingColor(rating), width: getRatingWeight(rating) + 6, height: getRatingWeight(rating) + 6 }} aria-hidden="true" />
            <span>{rating === 'UNKNOWN' ? 'Unknown/unrated' : `${rating} / F${rating.replace('EF', '')}`}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 max-w-40 text-[0.68rem] text-slate-500">Tracks use matching colors and thicker strokes for stronger tornadoes.</p>
    </div>
  );
}
