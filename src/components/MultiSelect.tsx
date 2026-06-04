import type { SelectOption } from '../types/tornado';

type MultiSelectProps = {
  id: string;
  label: string;
  options: SelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  helpText?: string;
};

export function MultiSelect({ id, label, options, values, onChange, disabled = false, helpText }: MultiSelectProps) {
  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <select
        id={id}
        multiple
        disabled={disabled}
        value={values}
        onChange={(event) => onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value))}
        className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-storm-500 focus:ring-2 focus:ring-storm-500/30 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}{option.count !== undefined ? ` (${option.count})` : ''}
          </option>
        ))}
      </select>
      {helpText ? <span className="mt-1 block text-xs font-normal text-slate-500">{helpText}</span> : null}
    </label>
  );
}
