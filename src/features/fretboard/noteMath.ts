export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "E#"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

const noteValues: Record<NoteName, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export function noteToPitchClass(note: string): number {
  const knownValue = noteValues[note as NoteName];
  if (knownValue !== undefined) {
    return knownValue;
  }

  const naturalValues: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let value = naturalValues[note[0]];
  for (const accidental of note.slice(1)) {
    value += accidental === "#" ? 1 : -1;
  }
  return normalizePitchClass(value);
}

export function pitchClassToNote(pitchClass: number, preferFlats: boolean): NoteName {
  const normalized = normalizePitchClass(pitchClass);
  return (preferFlats ? flatNames : sharpNames)[normalized];
}

export function normalizePitchClass(value: number): number {
  return ((value % 12) + 12) % 12;
}

export function notesMatch(left: string, right: string): boolean {
  return noteToPitchClass(left) === noteToPitchClass(right);
}

export function shouldPreferFlats(root: string): boolean {
  return root.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(root);
}
