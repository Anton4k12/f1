import type { Location, Position, Session, OptimizedLocation } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import ky from "ky";
// import F1CircuitMap from "@/components/f1";
import spinner from "@/assets/spinner.svg";
import { F1CircuitV2 } from "@/components/f1v2";
import { Driver } from "@/components/Driver";
import { useQuery } from "@tanstack/react-query";
import { isCacheAlreadyExist, readFromCache, saveToCache } from "@/utils";
// import { Leaderboard } from "@/components/leaderboard";
import { useState } from "react";

export const Route = createFileRoute("/session/$sessionKey")({
  component: Session,
});

function Session() {
  const params = Route.useParams();
  const [currentTime, setCurrentTime] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const sessionKey = Number(params.sessionKey);

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["session", params.sessionKey],
    queryFn: () => getSession(Number(params.sessionKey)),
  });

  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError,
  } = useQuery<OptimizedLocation[]>({
    queryKey: ["locations", params.sessionKey],
    queryFn: async () => {
      const cacheKey = `locations-${sessionKey}`;
      const cacheExists = await isCacheAlreadyExist(cacheKey);
      if (cacheExists) {
        return await readFromCache<OptimizedLocation>(cacheKey);
      }
      const locations = await getLocations(sessionKey, [81, 4]);
      await saveToCache(cacheKey, locations);
      return locations;
    },
  });

  // const {
  //   data: intervalsData,
  //   isLoading: isIntervalsLoading,
  //   error: intervalsError,
  // } = useQuery({
  //   queryKey: ["intervals", sessionKey],

  //   queryFn: async () => {
  //     const cacheKey = `intervals-${sessionKey}`;

  //     if (isCacheAlreadyExist(cacheKey)) {
  //       return readFromCache(cacheKey) as Interval[];
  //     }

  //     const intervals = await getIntervals(sessionKey);

  //     saveToCache(cacheKey, intervals);

  //     return intervals;
  //   },
  // });

  const {
    data: positionsData,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
    queryKey: ["position", sessionKey],

    queryFn: () => getPositions(sessionKey),
  });

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLocationsLoading || isSessionLoading || isPositionsLoading) {
    return (
      <div className="flex font-medium items-center gap-2 justify-center h-screen">
        Loading the track
        <img className="size-4" src={spinner} />
      </div>
    );
  }
  if (locationsError || !locationsData) {
    return <pre>{locationsError?.message}</pre>;
  }
  if (sessionError || !sessionData) {
    return <pre>{sessionError?.message}</pre>;
  }
  if (positionsError || !positionsData) {
    return <pre>{positionsError?.message}</pre>;
  }
  // console.log({ data, isLoading });
  console.log({ locationsData });
  return (
    <div className="flex px-4 lg:flex-row gap-10  min-h-screen flex-col w-full items-center justify-center">
      <div className="px-4 lg:px-0 w-full max-w-xl">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">
            Race Time: {formatTime(currentTime)}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-sm">Speed: {speedMultiplier}x</span>
            <input
              type="range"
              min="0.25"
              max="1000"
              step="0.25"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="w-48"
            />
          </div>
        </div>
        <F1CircuitV2
          points={locationsData.map((point) => {
            return { x: point.x, y: point.y };
          })}
        >
          <Driver
            locations={locationsData.filter((loc) => loc.n === 81)}
            onTimeUpdate={setCurrentTime}
            speedMultiplier={speedMultiplier}
          />
        </F1CircuitV2>
      </div>
      {/* <pre>{JSON.stringify(sessionData, null, 2)}</pre> */}
      {/* <Leaderboard
        dateStart={sessionData.date_start}
        positions={positionsData}
      ></Leaderboard> */}
    </div>
  );
}

// async function getIntervals(sessionKey: number) {
//   const intervals = await ky
//     .get<Interval[]>("https://api.openf1.org/v1/intervals", {
//       searchParams: {
//         session_key: sessionKey,
//       },
//     })
//     .json();

//   return intervals;
// }

async function getPositions(sessionKey: number) {
  const positions = await ky
    .get<Position[]>("https://api.openf1.org/v1/position", {
      searchParams: {
        session_key: sessionKey,
      },
    })
    .json();

  return positions;
}

async function getSession(sessionKey: number) {
  const sessions = await ky
    .get<Session[]>("https://api.openf1.org/v1/sessions", {
      searchParams: {
        session_key: sessionKey,
      },
    })
    .json();

  return sessions[0];
}

// getLocations({sessionKey: 9662, drivers: [1, 44]})

async function getLocations(sessionKey: number, drivers: number[]) {
  const locationsPromises = drivers.map(async (driverNumber) => {
    const locations = await ky
      .get<Location[]>("https://api.openf1.org/v1/location", {
        searchParams: {
          session_key: sessionKey,
          driver_number: driverNumber,
        },
      })
      .json();
    return locations;
  });

  const locations = await Promise.all(locationsPromises);
  const dixi = locations.flat();

  return dixi.map((location) => {
    return {
      x: location.x,
      y: location.y,
      t: new Date(location.date).getTime(),
      n: location.driver_number,
    };
  });
}
