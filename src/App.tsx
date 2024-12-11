import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Location } from "./types";
import { getLocations } from "./api";
import F1CircuitMap from "./f1";

function SceneModifier({ data }: { data: Location[] | undefined }) {
  const { scene } = useThree();
  const sphereRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: "blue" })
    );
    sphereRef.current = sphere;
    scene.add(sphere);

    const updateInterval = 1; // 1 millisecond
    let index = 0;

    const intervalId = setInterval(() => {
      index = (index + 1) % data.length; // Loop through data
      const currentLocation = data[index];
      if (currentLocation) {
        sphere.position.set(
          currentLocation.x / 1000,
          currentLocation.z / 1000,
          currentLocation.y / 1000
        );
      }
    }, updateInterval);

    return () => {
      clearInterval(intervalId);
      scene.remove(sphere);
    };
  }, [data, scene]);

  return null;
}

// const data = JSON.parse(
//   localStorage.getItem("mockLocations4") || ""
// ) as Location[];

export function App() {
  const { data, isLoading } = useQuery({
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

  // console.log({ data, isLoading });
  console.log({ data });

  return (
    <div className="h-screen w-screen">
      <F1CircuitMap clusterRadius={300} locations={data}></F1CircuitMap>
    </div>
  );

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [5, 5, 5] }}>
        <OrbitControls />
        <Grid args={[100, 100]} />
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 0, 5]} color="red" />
        {data && <SceneModifier data={data} />}
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0, 0, 0, 0.5)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        <strong>Current Location:</strong>
        {data && data.length > 0 && (
          <>
            <div>X: {data[0].x.toFixed(2)}</div>
            <div>Z: {data[0].z.toFixed(2)}</div>
            <div>Y: {data[0].y.toFixed(2)}</div>
            <div>Current date: {data[0].date}</div>
          </>
        )}
      </div>
    </div>
  );
}
