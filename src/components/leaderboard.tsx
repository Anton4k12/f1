import { Position } from "@/types";
import { useState } from "react";
import triangleUp from "@/assets/triangleUp.svg";
import triangleDown from "@/assets/triangleDown.svg";
import { useInterval } from "usehooks-ts";
import { getPositionChange, getPositionsAtTimestamp } from "@/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";

let i = 0;

export const Leaderboard = ({
  positions,
  dateStart,
}: {
  positions: Position[];
  dateStart: string;
}) => {
  const initialPositions = positions.filter((position) => {
    if (new Date(position.date) <= new Date(dateStart)) {
      return true;
    }

    return false;
  });

  const initialLeaderboard = initialPositions.map((pos) => {
    return {
      driverNumber: pos.driver_number,
      position: pos.position,
      positionChange: "same",
    };
  });

  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [currentDate, setCurrentDate] = useState(new Date(dateStart));

  const sortedLeaderboard = leaderboard.sort((a, b) => {
    return a.position - b.position;
  });

  const raceStartedPositions = positions.filter((driver) => {
    if (new Date(driver.date) >= new Date(dateStart)) {
      return true;
    }
    return false;
  });

  const raceStartedDates = raceStartedPositions.map((pos) => {
    return new Date(pos.date);
  });

  const uniqueDates = Array.from(new Set(raceStartedDates));

  useInterval(() => {
    if (i > uniqueDates.length - 1) return;

    const date = uniqueDates[i];

    setCurrentDate(date);

    const newPositions = getPositionsAtTimestamp(date, positions);

    const positionsToSet = Object.entries(newPositions).map((pos) => {
      return { driverNumber: pos[1], position: pos[0] };
    });

    setLeaderboard((prevLeaderboard) => {
      const newLeaderboard = positionsToSet.map((driver) => {
        const prevPosition = prevLeaderboard.find((prevDriver) => {
          return driver.driverNumber === prevDriver.driverNumber;
        })?.position;

        return {
          driverNumber: driver.driverNumber,
          position: Number(driver.position),
          positionChange: prevPosition
            ? getPositionChange(prevPosition, Number(driver.position))
            : "same",
        };
      });
      return newLeaderboard;
    });

    i++;
  }, 100);

  const [parent] = useAutoAnimate(/* optional config */);

  return (
    <div ref={parent} className="flex w-1/4 gap-1 flex-col">
      <div>{currentDate.toLocaleTimeString()}</div>
      <div className="grid grid-cols-3 text-sm rounded-full px-2 py-1">
        <div className="col-span-1">Position</div>
        <div className="col-span-1 whitespace-nowrap">Driver Number</div>
        <div className="col-span-1 text-right">Position Change</div>
      </div>
      {sortedLeaderboard.map((driver) => {
        return (
          <div
            key={driver.driverNumber}
            className="grid grid-cols-3 border text-sm rounded-full px-2 py-1 justify-between"
          >
            <div className="col-span-1">#{driver.position}</div>
            <div className="col-span-1">{driver.driverNumber}</div>
            <div className="col-span-1 flex justify-end">
              {driver.positionChange === "same" && "—"}
              {driver.positionChange === "down" && <img src={triangleUp}></img>}
              {driver.positionChange === "up" && <img src={triangleDown}></img>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
