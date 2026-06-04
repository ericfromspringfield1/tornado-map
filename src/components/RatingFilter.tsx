import { STANDARD_RATINGS, getRatingColor } from '../utils/ratings';

type Props = {
  selected: string[];
  onChange: (ratings: string[]) => void;
};

export function RatingFilter({ selected, onChange }: Props) {
  const toggle = (rating: string) => {
    onChange(selected.includes(rating) ? selected.filter((item) => item !== rating) : [...selected, rating]);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-800">Rating</legend>
      <div className="grid grid-cols-3 gap-2">
        {STANDARD_RATINGS.map((rating) => (
          <label key={rating} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm">
            <input type="checkbox" checked={selected.includes(rating)} onChange={() => toggle(rating)} className="rounded border-slate-300 text-storm-700 focus:ring-storm-500" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: getRatingColor(rating) }} />
            <span>{rating === 'UNKNOWN' ? 'Unknown' : rating}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
