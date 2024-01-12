"use client";

import { Line, LineChart, ResponsiveContainer, XAxis } from "recharts";

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
  data: number[];
};
export function Overview({ data }: OverviewType) {
  const mean = calculateMean(data);
  const std = calculateStandardDeviation(data);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data.map((elo) => ({ x: elo, y: pdf(elo, mean, std) }))}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="x" stroke="#888888" tickLine={false} axisLine={false} />
        <Line type="monotone" dot={false} dataKey="y" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
