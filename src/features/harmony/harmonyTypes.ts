export type ChordQuality = "major" | "minor" | "diminished";
export type DiatonicDegree = "I" | "ii" | "iii" | "IV" | "V" | "vi" | "vii";

export interface DiatonicChord {
  id: string;
  key: string;
  degree: DiatonicDegree;
  root: string;
  quality: ChordQuality;
  symbol: string;
}
