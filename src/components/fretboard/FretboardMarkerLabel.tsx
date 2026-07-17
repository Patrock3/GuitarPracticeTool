import type { FretMarker } from "../../features/triads/triadTypes";
import { sequenceNumber } from "../../features/progression/progressionFormat";

export type FretboardLabelMode = "notes" | "tab";

interface FretboardMarkerLabelProps {
  marker: FretMarker;
  mode: FretboardLabelMode;
  progressionIndex: number | null;
}

export function FretboardMarkerLabel({ marker, mode, progressionIndex }: FretboardMarkerLabelProps) {
  if (mode === "tab") {
    return <span className="text-[clamp(0.8rem,1.3vw,1rem)] font-black leading-none tabular-nums">{marker.fret}</span>;
  }

  return (
    <>
      <span className="text-[clamp(0.72rem,1.15vw,0.95rem)] font-black leading-none">
        {progressionIndex === null ? (marker.interval === "1" ? "R" : marker.interval) : sequenceNumber(progressionIndex)}
      </span>
      <span className="mt-0.5 text-[clamp(0.58rem,0.85vw,0.72rem)] font-bold leading-none opacity-90">{marker.note}</span>
    </>
  );
}
