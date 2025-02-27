import { createFileRoute, Link } from '@tanstack/react-router';
import austria from '../assets/austria.jpg';
import azerbaijan from '../assets/azerbaijan.webp';
import britain from '../assets/britain.jpg';
import hungary from '../assets/hungary.jpg';
import miami from '../assets/miami.jpg';
import monaco from '../assets/monaco.webp';

export const Route = createFileRoute('/')({
  component: Home,
});

const tracks = [
  { name: 'Miami International Autodrome', img: miami, sessionKey: 9506 },
  {
    name: 'Circuit de Monaco',
    img: monaco,
    sessionKey: 9523,
  },
  { name: 'Red Bull Ring', img: austria, sessionKey: 9550 },
  {
    name: 'Silverstone',
    img: britain,
    sessionKey: 9558,
  },
  { name: 'Hungaroring', img: hungary, sessionKey: 9566 },
  {
    name: 'Baku City Circuit',
    img: azerbaijan,
    sessionKey: 9598,
  },
];

function Home() {
  return (
    <div className="flex lg:items-center px-8 py-8 lg:justify-center lg:h-screen">
      <div className="grid w-fit max-w-screen-xl lg:gap-16 gap-8 grid-cols-1 lg:grid-cols-3">
        {tracks.map((track) => {
          return (
            <Link
              to={`/session/${track.sessionKey}`}
              className="border relative text-white text-xl rounded-2xl overflow-hidden "
            >
              <div className="px-4 z-10 font-medium text-lg absolute text-center py-2">
                {track.name}
              </div>
              <img className="w-full object-cover h-60" src={track.img} />

              <div className="bg-gradient-to-b absolute w-full h-1/2 top-0 from-black/30 to-transparent"></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
