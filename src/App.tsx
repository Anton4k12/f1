import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import type { Location } from "./types";

export function App() {
  const rawData: Location[] = JSON.parse(
    localStorage.getItem("mockLocations4") || "[]"
  );

  // Filter data to include only points from 13:00 onwards
  // const filteredData = rawData.filter((location) => {
  //   const date = new Date(location.date);
  //   return date.getHours() >= 13;
  // });

  return <AnimatedDot data={rawData} />;
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
  const xScale = 50000;
  const yScale = 50000;

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 1);

    return () => clearInterval(interval);
  }, [data, playbackSpeed]);

  useEffect(() => {
    if (data.length > 0) {
      const location = data[currentIndex];
      controls.start({
        x: (location.x / xScale) * mapWidth,
        y: (location.y / yScale) * mapHeight,
        transition: { duration: 0.8, ease: "easeInOut" },
      });

      // Update the path's d attribute
      const prevPath = pathRef.current;
      const newPoint = `${(location.x / xScale) * mapWidth},${
        (location.y / yScale) * mapHeight
      }`;
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
        className="overflow-visible rotate-90"
        style={{
          position: "absolute",
          top: 100,
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
      <motion.div
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "blue",
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
