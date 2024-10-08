"use client";

import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { z } from "zod";

// Function to calculate the probability density function of a normal distribution
function pdf(x: number, mean: number, stdDev: number) {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -((x - mean) ** 2) / (2 * stdDev ** 2);
  return coefficient * Math.exp(exponent);
}
function calculateMean(numbers: number[]) {
  const sum = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  return sum / numbers.length;
}

function calculateStandardDeviation(numbers: number[]) {
  if (numbers.length < 2) {
    return NaN; // Standard deviation requires at least 2 data points
  }

  const mean = calculateMean(numbers);
  const squaredDifferences = numbers.map((x) => (x - mean) ** 2);
  const variance =
    squaredDifferences.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    ) /
    (numbers.length - 1);
  const standardDeviation = Math.sqrt(variance);

  return standardDeviation;
}

type OverviewType = {
  data: number[] | { overall_elo: number; user_elo: number | undefined }[];
};
export function Overview({ data }: OverviewType) {
  let eloCords:
    | { x: number; "overall elo": number }[]
    | { x: number; "overall elo": number; "user elo": number }[] = [];
  const parseData = z.array(z.number()).safeParse(data);
  if (parseData.success) {
    const mean = calculateMean(parseData.data);
    const std = calculateStandardDeviation(parseData.data);
    eloCords = parseData.data.map((elo) => ({
      x: elo,
      "overall elo": pdf(elo, mean, std),
    }));
  } else {
    const parseData = z
      .array(
        z.object({ overall_elo: z.number(), user_elo: z.number().optional() }),
      )
      .safeParse(data);
    if (parseData.success) {
      const userData = parseData.data
        .map((cord) => {
          return cord.user_elo ?? 0;
        })
        .filter((elo) => elo !== 0);
      const overallData = parseData.data.map((cord) => {
        return cord.overall_elo;
      });
      const userMean = calculateMean(userData);
      const userStd = calculateStandardDeviation(userData);
      const mean = calculateMean(overallData);
      const std = calculateStandardDeviation(overallData);
      eloCords = parseData.data.map((cord) => {
        if (cord.user_elo) {
          return {
            x: cord.overall_elo,
            "overall elo": pdf(cord.overall_elo, mean, std),
           "user elo": pdf(cord.user_elo, userMean, userStd),
          };
        }
        return {
          x: cord.overall_elo,
          "overall elo": pdf(cord.overall_elo, mean, std),
        };
      });
    }
  }
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={eloCords}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="x" stroke="#888888" tickLine={false} axisLine={false} />
        <Line
          type="monotone"
          dot={false}
          dataKey="overall elo"
          stroke="#8884d8"
        />
        <Line
          type="monotone"
          dot={false}
          dataKey="user elo"
          stroke="#82ca9d"
          strokeWidth={2}
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
}
