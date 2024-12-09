import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import type { Location } from "./types";
import { getLocations } from "./api";
import { useQuery } from "@tanstack/react-query";
import car from "./assets/car.png";

export function App() {
  // const rawData: Location[] = JSON.parse(
  //   localStorage.getItem("mockLocations4") || "[]"
  // );

  const { data } = useQuery({
    queryKey: ["locations"],
    queryFn: () => {
      const locations = localStorage.getItem("locations") || "";
      if (locations) {
        const parsedLocations = JSON.parse(locations) as Location[];
        // Take every 100th element when data is from localStorage
        return parsedLocations.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
      return getLocations({ sessionKey: 9662, driverNumber: 4 });
    },
  });

  if (!data) return null;

  // Filter data to include only points from 13:00 onwards
  // const filteredData = rawData.filter((location) => {
  //   const date = new Date(location.date);
  //   return date.getHours() >= 13;
  // });

  return <AnimatedDot data={data} />;
}

type AnimatedDotProps = {
  data: Location[];
};

function AnimatedDot({ data }: AnimatedDotProps) {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Playback speed
  const pathRef = useRef<string>("M0 0"); // Store the path's `d` attribute

  // Map dimensions
  const mapWidth = 800;
  const mapHeight = 600;

  // Scale factors for zooming out and fitting within the map
  // const xScale = Math.max(...data.map((d) => d.x)) || 1;
  // const yScale = Math.max(...data.map((d) => d.y)) || 1;
  const xScale = 10000;
  const yScale = 10000;

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [data, playbackSpeed]);

  useEffect(() => {
    if (data.length > 0) {
      const location = data[currentIndex];
      const x = (location.x / xScale) * mapWidth;
      // Invert the y coordinate for the dot to match the SVG path
      const y = mapHeight - (location.y / yScale) * mapHeight;

      controls.start({
        x: x,
        y: y,
        transition: { duration: 0.01, ease: "easeInOut" },
      });

      // Update path using the original (non-inverted) coordinates
      const prevPath = pathRef.current;
      const newPoint = `${x},${(location.y / yScale) * mapHeight}`;
      pathRef.current = `${prevPath} L${newPoint}`;
    }
  }, [currentIndex, data, controls]);

  return (
    <div
      className="inset-20 overflow-visible"
      style={{
        position: "relative",
        width: mapWidth,
        height: mapHeight,
        border: "1px solid #ccc",
      }}
    >
      <svg
        className="overflow-visible"
        style={{
          position: "absolute",
          top: 0,
          transform: "scaleY(-1)",
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <motion.path
          d={pathRef.current}
          fill="none"
          stroke="blue"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <strong>Current Date:</strong>{" "}
        {data[currentIndex]?.date || "No data available"}
      </div>
      <motion.img
        src={car}
        style={{
          position: "absolute",
          objectFit: "contain",
          width: "20px",
          height: "20px",
        }}
        animate={controls}
      />
      <div style={{ position: "absolute", bottom: 10, left: 10 }}>
        <label htmlFor="speed">Playback Speed:</label>
        <input
          id="speed"
          type="range"
          min="0.1"
          max="5000000"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          style={{ marginLeft: "10px" }}
        />
        <span>{playbackSpeed.toFixed(1)}x</span>
      </div>
    </div>
  );
}
