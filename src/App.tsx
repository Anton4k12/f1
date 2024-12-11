import { useQuery } from "@tanstack/react-query";
import { getLocations } from "./api";
import F1CircuitMap from "./f1";
import type { Location } from "./types";

// const data = JSON.parse(
//   localStorage.getItem("mockLocations4") || ""
// ) as Location[];

export function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const locations = localStorage.getItem("mockLocations4	") || "";
      if (locations) {
        const parsedLocations = JSON.parse(locations) as Location[];
        return parsedLocations.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
      const fetchedLocations = await getLocations({
        sessionKey: 9654,
        driverNumber: 55,
      });
      if (!locations) {
        localStorage.setItem("locations", JSON.stringify(fetchedLocations));
      }
      return fetchedLocations;
    },
  });

  if (isLoading) {
    return <div>isloading</div>;
  }

  if (error || !data) {
    return <pre>{error?.message}</pre>;
  }

  // console.log({ data, isLoading });
  console.log({ data });

  return (
    <div className="h-screen w-screen">
      <F1CircuitMap clusterRadius={300} locations={data}></F1CircuitMap>
    </div>
  );
}
