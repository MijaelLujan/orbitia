import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function isExpired(date: Date): boolean {
  return date.getTime() <= Date.now();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}