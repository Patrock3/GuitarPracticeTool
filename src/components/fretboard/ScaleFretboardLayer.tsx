import type { VisualStringGroup } from "../../data/stringSets";
import { noteToPitchClass } from "../../features/fretboard/noteMath";
import { getFrettedPitchClass } from "../../features/fretboard/standardTuning";
import type { GuitarString } from "../../features/fretboard/standardTuning";
import { stringsForGroup } from "../../features/triads/triadTargets";
import type { FretboardLabelMode } from "./FretboardMarkerLabel";
import { fretboardFretCount } from "./fretboardLayout";

interface ScaleMarker {
  degree: number;
  fret: number;
  note: string;
  string: GuitarString;
}

interface ScaleFretboardLayerProps {
  labelMode: FretboardLabelMode;
  notes: string[];
  stringGroup: VisualStringGroup;
}

const allStrings: GuitarString[] = [1, 2, 3, 4, 5, 6];

export function ScaleFretboardLayer({ labelMode, notes, stringGroup }: ScaleFretboardLayerProps) {
  const markers = buildScaleMarkers(notes, stringGroup);

  return markers.map((marker) => {
    const left = marker.fret === 0 ? 0 : ((marker.fret - 0.5) / fretboardFretCount) * 100;

    return (
      <div
        className="absolute z-[15] flex h-[clamp(2.25rem,3.5vw,3rem)] w-[clamp(2.25rem,3.5vw,3rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-zinc-700 text-white shadow-[0_3px_8px_rgba(30,24,18,0.3)]"
        key={`scale-${marker.string}-${marker.fret}`}
        style={{ left: `${left}%`, top: `${((marker.string - 0.5) / allStrings.length) * 100}%` }}
        title={`Scale degree ${marker.degree}: ${marker.note}, fret ${marker.fret}`}
      >
        <span className="text-sm font-black leading-none">
          {labelMode === "notes" ? marker.note : marker.degree === 1 ? "R" : marker.degree}
        </span>
      </div>
    );
  });
}

function buildScaleMarkers(notes: string[], stringGroup: VisualStringGroup): ScaleMarker[] {
  if (notes.length === 0) return [];

  const selectedStrings = stringGroup === "all" ? allStrings : stringsForGroup(stringGroup);

  return selectedStrings.flatMap((string) =>
    Array.from({ length: fretboardFretCount + 1 }, (_, fret) => {
      const noteIndex = notes.findIndex(
        (note) => noteToPitchClass(note) === getFrettedPitchClass(string, fret),
      );

      return noteIndex < 0
        ? []
        : [{ degree: noteIndex + 1, fret, note: notes[noteIndex], string }];
    }).flat(),
  );
}
