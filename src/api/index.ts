import ky from 'ky';
import type { Session, Location } from '../types';

export const getSession = async () => {
  const sessions = await ky
    .get<Session[]>('https://api.openf1.org/v1/sessions', {
      searchParams: {
        date_start: '2024-12-08',
      },
    })
    .json();

  console.log(sessions);

  return sessions[0];
};

export const getLocations = async (args: {
  sessionKey: number;
  driverNumber: number;
}) => {
  const locations = await ky
    .get<Location[]>('https://api.openf1.org/v1/location', {
      searchParams: {
        session_key: args.sessionKey,
        driver_number: args.driverNumber,
      },
    })
    .json();

  console.log(locations);

  return locations;
};
