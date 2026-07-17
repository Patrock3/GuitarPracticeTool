export type KeyQuality = "major" | "minor";

export interface MusicalKey {
  id: string;
  tonic: string;
  quality: KeyQuality;
  label: string;
}

const tonics = [
  "A", "A#", "Ab",
  "B", "B#", "Bb",
  "C", "C#", "Cb",
  "D", "D#", "Db",
  "E", "E#", "Eb",
  "F", "F#", "Fb",
  "G", "G#", "Gb",
] as const;

export const musicalKeys: MusicalKey[] = tonics.flatMap((tonic) =>
  (["major", "minor"] as const).map((quality) => ({
    id: `${tonic}-${quality}`,
    tonic,
    quality,
    label: `${tonic} ${quality}`,
  })),
);

export function findMusicalKey(id: string): MusicalKey {
  // Preserve workspace selections saved by versions where major keys were stored as just "C".
  return musicalKeys.find((key) => key.id === id)
    ?? musicalKeys.find((key) => key.tonic === id && key.quality === "major")
    ?? musicalKeys.find((key) => key.id === "C-major")!;
}
