import type { SelectOption } from '../types/tornado';
import { MultiSelect } from './MultiSelect';

type Props = {
  stateOptions: SelectOption[];
  countyOptions: SelectOption[];
  states: string[];
  counties: string[];
  onStatesChange: (states: string[]) => void;
  onCountiesChange: (counties: string[]) => void;
};

export function LocationFilter({ stateOptions, countyOptions, states, counties, onStatesChange, onCountiesChange }: Props) {
  return (
    <section className="grid gap-3" aria-labelledby="location-filter-heading">
      <h3 id="location-filter-heading" className="text-sm font-semibold text-slate-800">Location</h3>
      <MultiSelect id="states" label="States" options={stateOptions} values={states} onChange={onStatesChange} helpText="Hold Ctrl/Cmd to select multiple states." />
      <MultiSelect
        id="counties"
        label="Counties"
        options={countyOptions}
        values={counties}
        onChange={onCountiesChange}
        disabled={!states.length}
        helpText={states.length ? 'County choices are derived from selected states.' : 'Select at least one state to enable counties.'}
      />
    </section>
  );
}
