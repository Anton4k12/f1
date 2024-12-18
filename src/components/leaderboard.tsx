import React, { useState, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Interval } from "@/types";

interface DriverPosition extends Interval {
  position: number;
  previousPosition?: number;
  positionChange?: "up" | "down" | "same";
}

export const Leaderboard = ({
  dateStart,
  intervalsData,
}: {
  dateStart: string;
  intervalsData: Interval[];
}) => {
  const [leaderboardState, setLeaderboardState] = useState<DriverPosition[]>(
    []
  );
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [parentRef] = useAutoAnimate<HTMLDivElement>(); // Initialize AutoAnimate for the parent container

  useEffect(() => {
    if (!intervalsData || intervalsData.length === 0) return;

    const startDate = new Date(dateStart);

    // Sort and filter intervals once
    const sortedIntervals = intervalsData
      .filter((inter) => new Date(inter.date) > startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedIntervals.length === 0) return;

    const intervalId = setInterval(() => {
      // Stop if we've processed all intervals
      if (currentIntervalIndex >= sortedIntervals.length) {
        clearInterval(intervalId);
        return;
      }

      // Get current interval
      const interval = sortedIntervals[currentIntervalIndex];

      setLeaderboardState((prevState) => {
        const updatedLeaderboard = [...prevState];

        // Find existing driver entry
        const existingDriverIndex = updatedLeaderboard.findIndex(
          (entry) => entry.driver_number === interval.driver_number
        );

        const driverEntry: DriverPosition = {
          ...interval,
          position: 0,
          previousPosition:
            existingDriverIndex !== -1
              ? updatedLeaderboard[existingDriverIndex].position
              : undefined,
        };

        // Remove existing entry if found
        if (existingDriverIndex !== -1) {
          updatedLeaderboard.splice(existingDriverIndex, 1);
        }

        // Add updated entry
        updatedLeaderboard.push(driverEntry);

        // Sort by gap to leader
        updatedLeaderboard.sort(
          (a, b) =>
            (a.gap_to_leader ?? Infinity) - (b.gap_to_leader ?? Infinity)
        );

        // Reassign positions and calculate changes
        updatedLeaderboard.forEach((entry, index) => {
          entry.position = index + 1;

          if (entry.previousPosition !== undefined) {
            if (entry.position < entry.previousPosition) {
              entry.positionChange = "up";
            } else if (entry.position > entry.previousPosition) {
              entry.positionChange = "down";
            } else {
              entry.positionChange = "same";
            }
          }
        });

        return updatedLeaderboard;
      });

      // Update the displayed current time
      setCurrentTime(new Date(interval.date).toLocaleTimeString());

      // Move to the next interval
      setCurrentIntervalIndex((prev) => prev + 1);
    }, 300);

    return () => clearInterval(intervalId);
  }, [intervalsData, dateStart, currentIntervalIndex]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg w-full lg:max-w-md shadow-md  ">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">
        Race Leaderboard
      </h2>
      <div className="text-lg mb-2 text-gray-600">
        <strong>Current Time: </strong> {currentTime || "Waiting for data..."}
      </div>
      <div
        ref={parentRef}
        className="flex flex-col gap-1 overflow-y-visible h-full"
      >
        {leaderboardState.map((driver) => (
          <div
            key={driver.driver_number}
            className="bg-white px-2 h-8 rounded-lg shadow-sm border border-gray-300 flex items-center justify-between text-sm hover:shadow-md transition-transform transform hover:scale-105"
          >
            <div className="font-semibold text-gray-800">
              #{driver.position}
            </div>
            <div className="text-gray-600">Driver {driver.driver_number}</div>
            <div className="text-right text-gray-800">
              {driver.gap_to_leader !== null
                ? `${driver.gap_to_leader.toFixed(3)} sec`
                : "N/A"}
            </div>
            <div className="text-center">
              {driver.positionChange === "up" && (
                <span className="text-green-500 text-lg">▲</span>
              )}
              {driver.positionChange === "down" && (
                <span className="text-red-500 text-lg">▼</span>
              )}
              {driver.positionChange === "same" && (
                <span className="text-gray-500 text-lg">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
