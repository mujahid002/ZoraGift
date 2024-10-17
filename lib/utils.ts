import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString(); // Return the count as is if it's less than 1000
  } else if (count < 1000000) {
    // For counts in thousands
    const formattedCount = (count / 1000).toFixed(1);
    return `${formattedCount}K`;
  } else {
    // For counts in millions
    const formattedCount = (count / 1000000).toFixed(1);
    return `${formattedCount}M`;
  }
}
