import { useEffect, useState } from "react";
import type { OptimizedLocation } from "@/types";

interface DriverProps {
  locations: OptimizedLocation[];
  onTimeUpdate?: (time: number) => void;
  speedMultiplier?: number;
}

const filterLocations = (locations: OptimizedLocation[]) => {
  // Sort locations by time
  const sortedLocations = [...locations].sort((a, b) => a.t - b.t);

  // Find the last occurrence of (0,0)
  const lastZeroIndex = sortedLocations.reduce((lastIndex, loc, index) => {
    if (loc.x === 0 && loc.y === 0) {
      return index;
    }
    return lastIndex;
  }, -1);

  // Return locations after the last (0,0) occurrence
  return sortedLocations.slice(lastZeroIndex + 1);
};

export const Driver: React.FC<DriverProps> = ({
  locations,
  onTimeUpdate,
  speedMultiplier = 1,
}) => {
  const [currentPosition, setCurrentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  console.log({ currentPosition, startTime, lastUpdateTime, elapsedTime });

  useEffect(() => {
    if (!locations.length) return;

    // Filter and sort locations
    const filteredLocations = filterLocations(locations);

    if (filteredLocations.length === 0) return;

    const firstTime = filteredLocations[0].t;

    const updatePosition = () => {
      const now = Date.now();

      if (!startTime) {
        setStartTime(now);
        setLastUpdateTime(now);
        return;
      }

      if (!lastUpdateTime) return;

      // Calculate time difference since last update, adjusted by speed multiplier
      const timeDiff = (now - lastUpdateTime) * speedMultiplier;
      const newElapsedTime = elapsedTime + timeDiff;
      setElapsedTime(newElapsedTime);
      setLastUpdateTime(now);

      // Find the location closest to current race time
      const currentLocation = filteredLocations.find(
        (loc) => loc.t - firstTime >= newElapsedTime
      );

      if (currentLocation) {
        setCurrentPosition({ x: currentLocation.x, y: currentLocation.y });
        onTimeUpdate?.(newElapsedTime);
      } else {
        // Reset animation when we reach the end
        setStartTime(now);
        setLastUpdateTime(now);
        setElapsedTime(0);
      }
    };

    const intervalId = setInterval(updatePosition, 16); // ~60fps for smoother animation

    return () => clearInterval(intervalId);
  }, [
    locations,
    onTimeUpdate,
    speedMultiplier,
    elapsedTime,
    lastUpdateTime,
    startTime,
  ]);

  if (!currentPosition) return null;

  return (
    <div
      className="absolute w-4 h-4 rounded-full bg-red-500 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-16"
      style={{
        left: `${currentPosition.x / 35 + 475}px`,
        top: `${currentPosition.y / 35 + 325}px`,
      }}
    />
  );
};
