import { Position } from "./types";

// Splits an array into chunks of a specific size
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunkiees: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkiees.push(array.slice(i, i + chunkSize));
  }
  return chunkiees;
}

const CHUNK_SIZE = 20;

// Generates a cache key for storing data
const getCacheKey = (cacheKey: string, chunkIndex: number) => {
  return `cache-${cacheKey}-${chunkIndex}`;
};

// Reads all chunks of data from localStorage for a given cache key
const readFromCache = (cacheKey: string): unknown[] => {
  const result: unknown[] = [];
  let chunkIndex = 0;

  while (true) {
    const locationsKey = getCacheKey(cacheKey, chunkIndex);
    const rawChunk = localStorage.getItem(locationsKey);

    if (!rawChunk) break; // Stop if no more chunks exist

    try {
      const chunk = JSON.parse(rawChunk) as unknown[];
      if (Array.isArray(chunk)) {
        result.push(...chunk);
      } else {
        console.warn(`Invalid data format in chunk: ${locationsKey}`);
      }
    } catch (error) {
      console.error(`Error parsing chunk: ${locationsKey}`, error);
    }

    chunkIndex++;
  }

  return result;
};

// Saves data to localStorage in chunks
const saveToCache = <T>(cacheKey: string, data: T[]) => {
  const chunkedLocations = chunkArray(data, CHUNK_SIZE);

  chunkedLocations.forEach((chunk, i) => {
    const locationsKey = getCacheKey(cacheKey, i);
    localStorage.setItem(locationsKey, JSON.stringify(chunk));
  });

  // Optionally, clear unused chunks beyond the current data size
  let extraChunkIndex = chunkedLocations.length;
  while (localStorage.getItem(getCacheKey(cacheKey, extraChunkIndex))) {
    localStorage.removeItem(getCacheKey(cacheKey, extraChunkIndex));
    extraChunkIndex++;
  }
};

// Checks if any cache exists for the provided key
const isCacheAlreadyExist = (cacheKey: string) => {
  const locationsKey = getCacheKey(cacheKey, 0);
  return Boolean(localStorage.getItem(locationsKey));
};

// Export the utilities
export { isCacheAlreadyExist, readFromCache, saveToCache };

export function getPositionsAtTimestamp(date: Date, data: Position[]) {
  const targetDate = new Date(date);
  targetDate.setMilliseconds(0);

  const filteredData = data.filter((update) => {
    const updateDate = new Date(update.date);
    return updateDate <= targetDate;
  });

  const positions: Record<number, number> = {};

  filteredData.forEach((posData) => {
    const driverNumber = posData.driver_number;
    const position = posData.position;

    positions[position] = driverNumber;
  });

  return positions;
}

export const getPositionChange = (
  prevPosition: number,
  newPosition: number
) => {
  if (newPosition > prevPosition) {
    return "up";
  }
  if (newPosition < prevPosition) return "down";
  return "same";
};
