import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAiResponseURL() {
  return import.meta.env.VITE_AI_RESPONSE_URL;
}

export function getZoomURL() {
  return import.meta.env.VITE_ZOOM_URL;
}

export function getRagURL() {
  return import.meta.env.VITE_RAG_URL;
}
