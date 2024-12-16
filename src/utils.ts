import { OptimizedLocation } from "./types";

export function chunkArray<T>(array: T[], numChunks: number): T[][] {
  if (numChunks <= 0) {
    throw new Error("Number of chunks must be greater than 0");
  }
  if (numChunks > array.length) {
    throw new Error("Number of chunks cannot be greater than array length");
  }

  const chunks: T[][] = [];
  const chunkSize = Math.ceil(array.length / numChunks);

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, Math.min(i + chunkSize, array.length)));
  }

  return chunks;
}

const CHUNKS_COUNT = 1000;

const getLocationKey = (sessionKey: number, chunkIndex: number) => {
  return `locations-${sessionKey}-${chunkIndex}`;
};

const readLocations = (sessionKey: number): OptimizedLocation[] => {
  const result: OptimizedLocation[] = [];

  for (let i = 0; i < CHUNKS_COUNT; i++) {
    const locationsKey = getLocationKey(sessionKey, i);
    const rawChunk = localStorage.getItem(locationsKey) as string | null;
    if (!rawChunk) continue;
    const chunk = JSON.parse(rawChunk) as OptimizedLocation[];
    result.push(...chunk);
  }

  return result;
};

const saveLocations = (sessionKey: number, locations: OptimizedLocation[]) => {
  const chunkedLocations = chunkArray(locations, CHUNKS_COUNT);

  chunkedLocations.forEach((chunk, i) => {
    const locationsKey = getLocationKey(sessionKey, i);
    localStorage.setItem(locationsKey, JSON.stringify(chunk));
  });
};

const isLocationsAlreadyExist = (sessionKey: number) => {
  const locationsKey = getLocationKey(sessionKey, 0);
  return Boolean(localStorage.getItem(locationsKey));
};

export { isLocationsAlreadyExist, readLocations, saveLocations };
