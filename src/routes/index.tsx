import { createFileRoute } from '@tanstack/react-router'
import miami from "../assets/miami.jpg";
import monaco from "../assets/monaco.webp";
import austria from "../assets/austria.jpg";
import britain from "../assets/britain.jpg";
import hungary from "../assets/hungary.jpg";
import azerbaijan from "../assets/azerbaijan.webp";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
    component: Home,
  })



const tracks = [
  { name: "Miami International Autodrome", img: miami, sessionKey: 9506 },
  {
    name: "Circuit de Monaco",
    img: monaco,
    sessionKey: 9523,
  },
  { name: "Red Bull Ring", img: austria, sessionKey: 9550 },
  {
    name: "Silverstone",
    img: britain,
    sessionKey: 9558,
  },
  { name: "Hungaroring", img: hungary, sessionKey: 9566 },
  {
    name: "Baku City Circuit",
    img: azerbaijan,
    sessionKey: 9598,
  },
];

 function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="grid w-fit max-w-screen-xl gap-16 grid-cols-3">
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
