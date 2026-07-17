import type { StringGroup } from "../../data/stringSets";
import type { TriadInversion } from "../../data/triads";
import { getFrettedMidi, getFrettedNote, getFrettedPitchClass } from "../fretboard/standardTuning";
import type { GuitarString } from "../fretboard/standardTuning";
import type { DiatonicChord } from "../harmony/harmonyTypes";
import { buildChordTones, intervalForPitchClass } from "./triadTheory";
import type { FretMarker, TriadInterval, TriadShape } from "./triadTypes";

const lowestIntervalForInversion: Record<TriadInversion, TriadInterval> = {
  root: "1",
  first: "3",
  second: "5",
};

const qualityIntervalSets: Record<DiatonicChord["quality"], TriadInterval[]> = {
  major: ["1", "3", "5"],
  minor: ["1", "b3", "5"],
  diminished: ["1", "b3", "b5"],
};

export function validateTriadShape(
  shape: TriadShape,
  expectedChord: DiatonicChord,
  expectedStringGroup: StringGroup,
): string[] {
  const errors: string[] = [];
  const expectedStrings = stringsForGroup(expectedStringGroup);
  const expectedIntervals = qualityIntervalSets[expectedChord.quality];

  if (shape.markers.length !== 3) {
    errors.push("Shape must contain exactly three notes.");
  }

  const strings = shape.markers.map((marker) => marker.string);
  if (!sameSet(strings, expectedStrings)) {
    errors.push(`Shape strings must match group ${expectedStringGroup}.`);
  }

  const intervals = shape.markers.map((marker) => marker.interval);
  if (!sameSet(intervals, expectedIntervals)) {
    errors.push(`Shape intervals must match ${expectedChord.quality} triad tones.`);
  }

  const frets = shape.markers.map((marker) => marker.fret);
  if (Math.max(...frets) - Math.min(...frets) > 5) {
    errors.push("Shape fret spread exceeds the MVP playability limit.");
  }

  shape.markers.forEach((marker) => {
    const actualPitchClass = getFrettedPitchClass(marker.string, marker.fret);
    const actualInterval = intervalForPitchClass(
      expectedChord.root,
      expectedChord.quality,
      actualPitchClass,
    );
    const actualNote = getFrettedNote(marker.string, marker.fret, expectedChord.root);

    if (actualInterval !== marker.interval) {
      errors.push(
        `String ${marker.string}, fret ${marker.fret} is ${actualNote}, not interval ${marker.interval}.`,
      );
    }

    if (actualNote !== marker.note) {
      errors.push(
        `String ${marker.string}, fret ${marker.fret} should be labelled ${actualNote}, not ${marker.note}.`,
      );
    }
  });

  const lowestMarker = [...shape.markers].sort(
    (left, right) => getFrettedMidi(left.string, left.fret) - getFrettedMidi(right.string, right.fret),
  )[0];
  const expectedBassInterval = expectedChord.quality === "diminished" && shape.inversion === "second"
    ? "b5"
    : expectedChord.quality !== "major" && shape.inversion === "first"
      ? "b3"
      : lowestIntervalForInversion[shape.inversion];

  if (lowestMarker?.interval !== expectedBassInterval) {
    errors.push(`Lowest note does not match ${shape.inversion} inversion.`);
  }

  return errors;
}

export function buildValidatedMarker(
  string: GuitarString,
  fret: number,
  chord: DiatonicChord,
): FretMarker | null {
  const pitchClass = getFrettedPitchClass(string, fret);
  const interval = intervalForPitchClass(chord.root, chord.quality, pitchClass);

  if (!interval) {
    return null;
  }

  return {
    string,
    fret,
    interval,
    note: getFrettedNote(string, fret, chord.root),
  };
}

export function stringsForGroup(stringGroup: StringGroup): GuitarString[] {
  const strings: Record<StringGroup, GuitarString[]> = {
    "123": [1, 2, 3],
    "234": [2, 3, 4],
    "345": [3, 4, 5],
    "456": [4, 5, 6],
  };

  return strings[stringGroup];
}

export function chordTonesForShape(chord: DiatonicChord) {
  return buildChordTones(chord.root, chord.quality);
}

function sameSet<T extends string | number>(left: T[], right: T[]): boolean {
  return left.length === right.length && left.every((item) => right.includes(item));
}
