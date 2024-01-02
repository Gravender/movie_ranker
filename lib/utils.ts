import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function camelCaseToTitleCase(input: string): string {
  // Split the input string by capital letters
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and join them with a space
  const titleCase = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return titleCase;
}
export function toTitleCase(input: string) {
  return input
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase())
    .join(" ");
}
