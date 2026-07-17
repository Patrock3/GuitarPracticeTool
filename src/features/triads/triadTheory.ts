import type { ChordQuality } from "../harmony/harmonyTypes";
import { normalizePitchClass, noteToPitchClass } from "../fretboard/noteMath";
import type { TriadInterval } from "./triadTypes";

export interface ChordTone {
  interval: TriadInterval;
  pitchClass: number;
  note: string;
}

const intervalSemitones: Record<ChordQuality, Record<TriadInterval, number | null>> = {
  major: {
    "1": 0,
    "3": 4,
    b3: null,
    "5": 7,
    b5: null,
  },
  minor: {
    "1": 0,
    "3": null,
    b3: 3,
    "5": 7,
    b5: null,
  },
  diminished: {
    "1": 0,
    "3": null,
    b3: 3,
    "5": null,
    b5: 6,
  },
};

export function buildChordTones(root: string, quality: ChordQuality): ChordTone[] {
  const rootPitchClass = noteToPitchClass(root);
  const formulas = intervalSemitones[quality];
  const letters = ["C", "D", "E", "F", "G", "A", "B"];
  const rootLetterIndex = letters.indexOf(root[0]);
  const naturalPitchClasses: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  return (Object.entries(formulas) as Array<[TriadInterval, number | null]>)
    .filter(([, semitones]) => semitones !== null)
    .map(([interval, semitones]) => {
      const pitchClass = normalizePitchClass(rootPitchClass + semitones!);
      const toneIndex = interval === "1" ? 0 : interval === "3" || interval === "b3" ? 2 : 4;
      const letter = letters[(rootLetterIndex + toneIndex) % letters.length];
      return {
        interval,
        pitchClass,
        note: spellPitchClass(letter, pitchClass, naturalPitchClasses),
      };
    });
}

function spellPitchClass(
  letter: string,
  pitchClass: number,
  naturalPitchClasses: Record<string, number>,
): string {
  let difference = pitchClass - naturalPitchClasses[letter];
  if (difference > 6) difference -= 12;
  if (difference < -6) difference += 12;
  return `${letter}${difference > 0 ? "#".repeat(difference) : "b".repeat(-difference)}`;
}

export function intervalForPitchClass(root: string, quality: ChordQuality, pitchClass: number): TriadInterval | null {
  const tone = buildChordTones(root, quality).find((item) => item.pitchClass === pitchClass);
  return tone?.interval ?? null;
}
