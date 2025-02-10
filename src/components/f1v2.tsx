interface Point {
  x: number;
  y: number;
}

interface PathProps {
  points: Point[];
  padding?: number;
  strokeWidth?: number;
  strokeColor?: string;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function calculateBounds(points: Point[]): Bounds {
  const bounds = points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxX: Math.max(acc.maxX, point.x),
      maxY: Math.max(acc.maxY, point.y),
    }),
    {
      minX: points[0].x,
      minY: points[0].y,
      maxX: points[0].x,
      maxY: points[0].y,
    }
  );

  return bounds;
}

function pointsToSVGPath(points: Point[]): string {
  if (points.length < 2) {
    throw new Error("At least 2 points are required to create a path");
  }

  const pathCommands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length; i++) {
    pathCommands.push(`L ${points[i].x} ${points[i].y}`);
  }

  pathCommands.push("Z");
  return pathCommands.join(" ");
}

const F1CircuitV2: React.FC<PathProps & { children?: React.ReactNode }> = ({
  points,
  padding = 10,
  strokeWidth = 2,
  strokeColor = "black",
  children,
}) => {
  if (points.length < 2) {
    return null;
  }

  const bounds = calculateBounds(points);
  const pathData = pointsToSVGPath(points);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full">
      <svg
        className="max-h-screen py-5 w-full"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
};

export { F1CircuitV2 };
