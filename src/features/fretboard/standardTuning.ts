import { normalizePitchClass, pitchClassToNote, shouldPreferFlats } from "./noteMath";
import type { NoteName } from "./noteMath";

export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6;

interface OpenString {
  string: GuitarString;
  note: NoteName;
  midi: number;
}

export const standardTuning: Record<GuitarString, OpenString> = {
  1: { string: 1, note: "E", midi: 64 },
  2: { string: 2, note: "B", midi: 59 },
  3: { string: 3, note: "G", midi: 55 },
  4: { string: 4, note: "D", midi: 50 },
  5: { string: 5, note: "A", midi: 45 },
  6: { string: 6, note: "E", midi: 40 },
};

export function getFrettedNote(string: GuitarString, fret: number, rootForSpelling: string): NoteName {
  const open = standardTuning[string];
  if (rootForSpelling === "E#" && (open.midi + fret) % 12 === 5) {
    return "E#";
  }

  return pitchClassToNote(open.midi + fret, shouldPreferFlats(rootForSpelling));
}

export function getFrettedMidi(string: GuitarString, fret: number): number {
  return standardTuning[string].midi + fret;
}

export function getFrettedPitchClass(string: GuitarString, fret: number): number {
  return normalizePitchClass(getFrettedMidi(string, fret));
}
