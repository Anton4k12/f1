import { Position } from "./types";

// Splits an array into chunks of a specific size
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunkiees: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkiees.push(array.slice(i, i + chunkSize));
  }
  return chunkiees;
}

const DB_NAME = "f1-cache";
const STORE_NAME = "cache-store";
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Read data from IndexedDB
export const readFromCache = async <T>(cacheKey: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cacheKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error("Error reading from cache:", error);
    return [];
  }
};

// Save data to IndexedDB
export const saveToCache = async <T>(
  cacheKey: string,
  data: T[]
): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, cacheKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
};

// Check if cache exists in IndexedDB
export const isCacheAlreadyExist = async (
  cacheKey: string
): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(cacheKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result > 0);
    });
  } catch (error) {
    console.error("Error checking cache existence:", error);
    return false;
  }
};

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
