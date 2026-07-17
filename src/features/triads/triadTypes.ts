import type { StringGroup } from "../../data/stringSets";
import type { TriadInversion } from "../../data/triads";
import type { GuitarString } from "../fretboard/standardTuning";
import type { DiatonicChord, DiatonicDegree } from "../harmony/harmonyTypes";

export type TriadInterval = "1" | "3" | "b3" | "5" | "b5";

export interface FretMarker {
  string: GuitarString;
  fret: number;
  note: string;
  interval: TriadInterval;
}

export interface TriadShape {
  id: string;
  chord: DiatonicChord;
  stringGroup: StringGroup;
  inversion: TriadInversion;
  markers: FretMarker[];
}

export interface TriadPracticeTarget {
  id: string;
  key: string;
  degree: DiatonicDegree;
  chordRoot: string;
  chordQuality: DiatonicChord["quality"];
  stringGroup: StringGroup;
  inversion: TriadInversion;
}
