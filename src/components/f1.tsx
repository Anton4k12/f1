import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Line, MapControls } from "@react-three/drei";
import type { Location } from "../types";

// Define the Location type matching your TypeScript type

type ClusteredLocation = {
  x: number;
  y: number;
  z: number;
  count: number;
  driverNumbers: number[];
  originalIndex: number;
};

type F1CircuitMapProps = {
  locations: Location[];
  clusterRadius?: number;
};

const F1CircuitMap: React.FC<F1CircuitMapProps> = ({
  locations,
  clusterRadius = 10,
}) => {
  // Cluster and connect locations with Y-axis proximity algorithm
  const { circuitPath } = useMemo(() => {
    const clusters: ClusteredLocation[] = [];

    // First, cluster locations
    locations.forEach((location, originalIndex) => {
      // Scale down coordinates for rendering
      const scaledX = location.x / 50;
      const scaledY = location.y / 50;

      // Find if location belongs to an existing cluster
      const existingCluster = clusters.find(
        (cluster) =>
          Math.abs(cluster.x - scaledX) <= clusterRadius / 50 &&
          Math.abs(cluster.y - scaledY) <= clusterRadius / 50
      );

      if (existingCluster) {
        // Update existing cluster
        existingCluster.x =
          (existingCluster.x * existingCluster.count + scaledX) /
          (existingCluster.count + 1);
        existingCluster.y =
          (existingCluster.y * existingCluster.count + scaledY) /
          (existingCluster.count + 1);
        existingCluster.z =
          (existingCluster.z * existingCluster.count + location.z / 50) /
          (existingCluster.count + 1);
        existingCluster.count++;

        // Add unique driver numbers
        if (!existingCluster.driverNumbers.includes(location.driver_number)) {
          existingCluster.driverNumbers.push(location.driver_number);
        }
      } else {
        // Create new cluster
        clusters.push({
          x: scaledX,
          y: scaledY,
          z: location.z / 50,
          count: 1,
          driverNumbers: [location.driver_number],
          originalIndex,
        });
      }
    });

    // Y-Axis Proximity Connection Algorithm
    const connectDots = (dots: ClusteredLocation[]) => {
      // Find dot closest to Y-axis first (leftmost dot)
      let remainingDots = [...dots];
      const connected: ClusteredLocation[] = [];

      // Find the dot closest to Y-axis
      const closestToYAxis = remainingDots.reduce((closest, dot) =>
        dot.x < closest.x ? dot : closest
      );

      connected.push(closestToYAxis);
      remainingDots = remainingDots.filter((d) => d !== closestToYAxis);

      // Connect subsequent dots to the closest unconnected dot
      while (remainingDots.length > 0) {
        const lastConnected = connected[connected.length - 1];
        const closestDot = remainingDots.reduce((closest, dot) => {
          const lastDistance = Math.hypot(
            lastConnected.x - dot.x,
            lastConnected.y - dot.y,
            lastConnected.z - dot.z
          );
          const closestDistance = Math.hypot(
            lastConnected.x - closest.x,
            lastConnected.y - closest.y,
            lastConnected.z - closest.z
          );
          return lastDistance < closestDistance ? dot : closest;
        });

        connected.push(closestDot);
        remainingDots = remainingDots.filter((d) => d !== closestDot);
      }

      return connected;
    };

    // Apply Y-axis proximity connection
    const sequencedClusters = connectDots(clusters);

    // Create circuit path from sequenced clusters
    const circuitPath = sequencedClusters.map((cluster) => [
      cluster.x / 10,
      cluster.y / 10,
      cluster.z / 10,
    ]);

    // Create sequenced connections between consecutive clusters
    const sequencedConnections = sequencedClusters
      .slice(0, -1)
      .map((cluster, index) => {
        const nextCluster = sequencedClusters[index + 1];
        return [
          [cluster.x, cluster.y, cluster.z],
          [nextCluster.x, nextCluster.y, nextCluster.z],
        ];
      });

    return {
      clusteredLocations: sequencedClusters,
      circuitPath,
      sequencedConnections,
    };
  }, [locations, clusterRadius]);

  return (
    <Canvas camera={{ position: [15, 15, 15] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />

      {/* Circuit Line */}
      <Line
        rotation={[1.57, 0, 0]}
        //@ts-expect-error types
        points={circuitPath}
        color="red"
        lineWidth={2}
        transparent
        opacity={0.5}
      />

      {/* Sequenced Connections */}
      {/* {sequencedConnections.map((connection, index) => (
        <Line
          key={`connection-${index}`}
          points={connection}
          color="green"
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))} */}

      {/* Clustered locations */}
      <Grid args={[100, 100]} />

      <MapControls enablePan={false} />
    </Canvas>
  );
};

export default F1CircuitMap;
