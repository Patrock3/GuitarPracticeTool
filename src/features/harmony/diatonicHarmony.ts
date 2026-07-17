import type { MusicalKey } from "../../data/keys";
import type { ChordQuality, DiatonicChord, DiatonicDegree } from "./harmonyTypes";

const noteLetters = ["C", "D", "E", "F", "G", "A", "B"] as const;
const naturalPitchClasses: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const degrees: DiatonicDegree[] = ["I", "ii", "iii", "IV", "V", "vi", "vii"];
const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
const majorQualities: ChordQuality[] = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
const minorQualities: ChordQuality[] = ["minor", "diminished", "major", "minor", "minor", "major", "major"];

export function buildDiatonicScale(key: MusicalKey): DiatonicChord[] {
  const intervals = key.quality === "major" ? majorIntervals : minorIntervals;
  const qualities = key.quality === "major" ? majorQualities : minorQualities;
  const tonicPitchClass = notePitchClass(key.tonic);
  const tonicLetterIndex = noteLetters.indexOf(key.tonic[0] as (typeof noteLetters)[number]);

  return intervals.map((interval, index) => {
    const root = spellNote(noteLetters[(tonicLetterIndex + index) % 7], tonicPitchClass + interval);
    const quality = qualities[index];
    const degree = degrees[index];

    return {
      id: `${key.id}-${degree}`,
      key: key.id,
      degree,
      root,
      quality,
      symbol: formatChordSymbol(root, quality),
    };
  });
}

function notePitchClass(note: string): number {
  let value = naturalPitchClasses[note[0]];
  for (const accidental of note.slice(1)) value += accidental === "#" ? 1 : -1;
  return ((value % 12) + 12) % 12;
}

function spellNote(letter: string, pitchClass: number): string {
  const target = ((pitchClass % 12) + 12) % 12;
  let difference = target - naturalPitchClasses[letter];
  if (difference > 6) difference -= 12;
  if (difference < -6) difference += 12;
  return `${letter}${difference > 0 ? "#".repeat(difference) : "b".repeat(-difference)}`;
}

export function formatChordSymbol(root: string, quality: ChordQuality): string {
  if (quality === "minor") return `${root}m`;
  if (quality === "diminished") return `${root}dim`;
  return root;
}
