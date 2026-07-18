import type { TriadInversion } from "../../data/triads";

export const fretboardFretCount = 12;

export const inversionStyles: Record<TriadInversion, { marker: string; shortLabel: string }> = {
  root: { marker: "bg-teal-800", shortLabel: "Root" },
  first: { marker: "bg-amber-600", shortLabel: "1st" },
  second: { marker: "bg-rose-700", shortLabel: "2nd" },
};
