import type { StringGroup } from "../../data/stringSets";
import { triadInversions } from "../../data/triads";
import type { TriadInversion } from "../../data/triads";
import type { DiatonicChord } from "../harmony/harmonyTypes";
import type { GuitarString } from "../fretboard/standardTuning";
import { getFrettedMidi } from "../fretboard/standardTuning";
import type { FretMarker, TriadPracticeTarget, TriadShape } from "./triadTypes";
import { buildValidatedMarker, stringsForGroup, validateTriadShape } from "./triadShapeValidation";

const maxFret = 15;
const maxFretSpread = 5;

export function buildTriadShapes(chord: DiatonicChord, stringGroup: StringGroup): TriadShape[] {
  const candidates = buildCandidateShapes(chord, stringGroup);

  return triadInversions.flatMap((inversion) => {
    const shape = candidates
      .filter((candidate) => candidate.inversion === inversion)
      .sort(compareShapes)[0];

    return shape ? [shape] : [];
  });
}

export function buildTriadTarget(shape: TriadShape): TriadPracticeTarget {
  return {
    id: shape.id,
    key: shape.chord.key,
    degree: shape.chord.degree,
    chordRoot: shape.chord.root,
    chordQuality: shape.chord.quality,
    stringGroup: shape.stringGroup,
    inversion: shape.inversion,
  };
}

export function buildTriadTargetId(
  chord: DiatonicChord,
  stringGroup: StringGroup,
  inversion: TriadInversion,
  frets?: number[],
): string {
  const fretSuffix = frets ? `:${frets.join("-")}` : "";
  return `${chord.key}:${chord.degree}:${chord.root}:${chord.quality}:${stringGroup}:${inversion}${fretSuffix}`;
}

export { stringsForGroup };

function buildCandidateShapes(chord: DiatonicChord, stringGroup: StringGroup): TriadShape[] {
  const strings = stringsForGroup(stringGroup);
  const stringMarkers = strings.map((string) => findChordToneMarkers(string, chord));
  const candidates: TriadShape[] = [];

  stringMarkers[0].forEach((first) => {
    stringMarkers[1].forEach((second) => {
      stringMarkers[2].forEach((third) => {
        const markers = [first, second, third];
        if (!isClosedTriadCandidate(markers)) {
          return;
        }

        const inversion = determineInversion(markers, chord.quality);
        const shape: TriadShape = {
          id: buildTriadTargetId(chord, stringGroup, inversion, markers.map((marker) => marker.fret)),
          chord,
          stringGroup,
          inversion,
          markers,
        };
        const errors = validateTriadShape(shape, chord, stringGroup);

        if (errors.length === 0) {
          candidates.push(shape);
        }
      });
    });
  });

  return candidates;
}

function findChordToneMarkers(string: GuitarString, chord: DiatonicChord): FretMarker[] {
  const markers: FretMarker[] = [];

  for (let fret = 0; fret <= maxFret; fret += 1) {
    const marker = buildValidatedMarker(string, fret, chord);
    if (marker) {
      markers.push(marker);
    }
  }

  return markers;
}

function isClosedTriadCandidate(markers: FretMarker[]): boolean {
  const intervals = new Set(markers.map((marker) => marker.interval));
  const frets = markers.map((marker) => marker.fret);

  return intervals.size === 3 && Math.max(...frets) - Math.min(...frets) <= maxFretSpread;
}

function determineInversion(markers: FretMarker[], quality: DiatonicChord["quality"]): TriadInversion {
  const lowest = [...markers].sort(
    (left, right) => getFrettedMidi(left.string, left.fret) - getFrettedMidi(right.string, right.fret),
  )[0];

  if (lowest.interval === "1") {
    return "root";
  }

  if (lowest.interval === "3" || lowest.interval === "b3") {
    return "first";
  }

  if (lowest.interval === "5" || (quality === "diminished" && lowest.interval === "b5")) {
    return "second";
  }

  return "root";
}

function compareShapes(left: TriadShape, right: TriadShape): number {
  const leftFrets = left.markers.map((marker) => marker.fret);
  const rightFrets = right.markers.map((marker) => marker.fret);
  const leftMin = Math.min(...leftFrets);
  const rightMin = Math.min(...rightFrets);
  const leftSpread = Math.max(...leftFrets) - leftMin;
  const rightSpread = Math.max(...rightFrets) - rightMin;

  if (leftMin !== rightMin) {
    return leftMin - rightMin;
  }

  return leftSpread - rightSpread;
}
