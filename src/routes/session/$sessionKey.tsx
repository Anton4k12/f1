import type { Location } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import ky from 'ky';
// import F1CircuitMap from "@/components/f1";
import spinner from '@/assets/spinner.svg';
import { F1CircuitV2 } from '@/components/f1v2';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/session/$sessionKey')({
  component: Session,
});

function Session() {
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["locations"],
  //   queryFn: () => getSession(Number(params.sessionKey)),
  // });

  const params = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', params.sessionKey],
    queryFn: () => {
      return getLocations({
        sessionKey: Number(params.sessionKey),
        driverNumber: 81,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex font-medium items-center gap-2 justify-center h-screen">
        Loading the track
        <img className="size-4" src={spinner} />
      </div>
    );
  }
  if (error || !data) {
    return <pre>{error?.message}</pre>;
  }
  // console.log({ data, isLoading });
  console.log({ data });
  return (
    <div className="h-screen w-screen">
      {/* <F1CircuitMap clusterRadius={300} locations={data}></F1CircuitMap> */}
      <F1CircuitV2
        points={data.map((point) => {
          return { x: point.x, y: point.y };
        })}
      ></F1CircuitV2>
    </div>
  );
}

// async function getSession(sessionKey: number) {
//   const sessions = await ky
//     .get<Session[]>("https://api.openf1.org/v1/sessions", {
//       searchParams: {
//         session_key: sessionKey,
//       },
//     })
//     .json();

//   return sessions[0];
// }

async function getLocations(args: {
  sessionKey: number;
  driverNumber: number;
}) {
  const locations = await ky
    .get<Location[]>('https://api.openf1.org/v1/location', {
      searchParams: {
        session_key: args.sessionKey,
        driver_number: args.driverNumber,
      },
    })
    .json();

  return locations.map((location) => {
    return {
      x: location.x,
      y: location.y,
      t: location.date,
      n: location.driver_number,
    };
  });
}
