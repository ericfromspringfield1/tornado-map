import sampleCsv from '../data/sample-tornadoes.csv?raw';
import type { TornadoEvent } from '../types/tornado';
import { parseTornadoData } from './parseTornadoData';

export type LoadedTornadoDataset = {
  events: TornadoEvent[];
  sourceLabel: string;
  error?: string;
};

type DatasetLoaderOptions = {
  signal?: AbortSignal;
  fetcher?: typeof fetch;
  datasetUrl?: string;
};

const GENERATED_DATASET_PATH = 'data/tornado-events.json';

export function getGeneratedDatasetUrl(baseUrl = import.meta.env.BASE_URL): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${GENERATED_DATASET_PATH}`;
}

export function loadSampleDataset(): TornadoEvent[] {
  return parseTornadoData(sampleCsv);
}

export async function loadTornadoDataset({ signal, fetcher = fetch, datasetUrl = getGeneratedDatasetUrl() }: DatasetLoaderOptions = {}): Promise<LoadedTornadoDataset> {
  try {
    const response = await fetcher(datasetUrl, { signal });
    if (response.status === 404) {
      return { events: loadSampleDataset(), sourceLabel: 'Bundled sample CSV' };
    }
    if (!response.ok) {
      throw new Error(`Unable to load generated NOAA dataset: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as Record<string, unknown>[];
    const events = parseTornadoData(payload);
    if (events.length) {
      return { events, sourceLabel: 'Generated NOAA/NCEI Storm Events tornado dataset' };
    }

    return {
      events: loadSampleDataset(),
      sourceLabel: 'Bundled sample CSV',
      error: 'Generated NOAA dataset was found, but it did not contain any tornado records.',
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return {
      events: loadSampleDataset(),
      sourceLabel: 'Bundled sample CSV fallback',
      error: error instanceof Error ? error.message : 'Unable to load tornado data.',
    };
  }
}
