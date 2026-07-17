import type { TriadInversion } from "../../data/triads";
import type { DiatonicChord } from "../harmony/harmonyTypes";
import type { TriadShape } from "../triads/triadTypes";

export interface ProgressionItem {
  id: number;
  chord: DiatonicChord;
  inversion: TriadInversion;
}

export interface ProgressionShape extends ProgressionItem {
  shape: TriadShape;
}
