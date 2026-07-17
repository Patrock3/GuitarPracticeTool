export type TriadInversion = "root" | "first" | "second";

export const triadInversions: TriadInversion[] = [
  "root",
  "first",
  "second",
];

export const triadInversionLabels: Record<TriadInversion, string> = {
  root: "Root position",
  first: "First inversion",
  second: "Second inversion",
};
