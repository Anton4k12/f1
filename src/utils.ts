import { Position } from "./types";

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

const getCacheKey = (cacheKey: string, chunkIndex: number) => {
  return `cache-${cacheKey}-${chunkIndex}`;
};

const readFromCache = (cacheKey: string): unknown[] => {
  const result: unknown[] = [];

  for (let i = 0; i < CHUNKS_COUNT; i++) {
    const locationsKey = getCacheKey(cacheKey, i);
    const rawChunk = localStorage.getItem(locationsKey) as string | null;
    if (!rawChunk) continue;
    const chunk = JSON.parse(rawChunk) as unknown[];
    result.push(...chunk);
  }

  return result;
};

const saveToCache = (cacheKey: string, data: unknown[]) => {
  const chunkedLocations = chunkArray(data, CHUNKS_COUNT);

  chunkedLocations.forEach((chunk, i) => {
    const locationsKey = getCacheKey(cacheKey, i);
    localStorage.setItem(locationsKey, JSON.stringify(chunk));
  });
};

const isCacheAlreadyExist = (cacheKey: string) => {
  const locationsKey = getCacheKey(cacheKey, 0);
  return Boolean(localStorage.getItem(locationsKey));
};

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
