import type { VisualStringGroup } from "../../data/stringSets";
import { noteToPitchClass } from "../../features/fretboard/noteMath";
import { getFrettedPitchClass } from "../../features/fretboard/standardTuning";
import type { GuitarString } from "../../features/fretboard/standardTuning";
import { stringsForGroup } from "../../features/triads/triadTargets";
import type { FretboardLabelMode } from "./FretboardMarkerLabel";
import { fretboardFretCount, inversionStyles } from "./fretboardLayout";

type ScaleChordTone = "root" | "third" | "fifth";

export const scaleChordToneStyles: Array<{
  label: string;
  marker: string;
  tone: ScaleChordTone;
}> = [
  { label: "Root", marker: inversionStyles.root.marker, tone: "root" },
  { label: "3rd", marker: inversionStyles.first.marker, tone: "third" },
  { label: "5th", marker: inversionStyles.second.marker, tone: "fifth" },
];

const scaleChordToneMarkerClasses: Record<ScaleChordTone, string> = {
  root: inversionStyles.root.marker,
  third: inversionStyles.first.marker,
  fifth: inversionStyles.second.marker,
};

interface ScaleMarker {
  chordTone: ScaleChordTone | null;
  degree: number;
  fret: number;
  note: string;
  string: GuitarString;
}

interface ScaleFretboardLayerProps {
  chordRoot?: string;
  labelMode: FretboardLabelMode;
  notes: string[];
  stringGroup: VisualStringGroup;
}

const allStrings: GuitarString[] = [1, 2, 3, 4, 5, 6];

export function ScaleFretboardLayer({ chordRoot, labelMode, notes, stringGroup }: ScaleFretboardLayerProps) {
  const markers = buildScaleMarkers(notes, stringGroup, chordRoot);

  return markers.map((marker) => {
    const left = marker.fret === 0 ? 0 : ((marker.fret - 0.5) / fretboardFretCount) * 100;

    return (
      <div
        className={`absolute z-[15] flex h-[clamp(2.25rem,3.5vw,3rem)] w-[clamp(2.25rem,3.5vw,3rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 text-white shadow-[0_3px_8px_rgba(30,24,18,0.3)] ${marker.chordTone ? scaleChordToneMarkerClasses[marker.chordTone] : "bg-zinc-600"}`}
        key={`scale-${marker.string}-${marker.fret}`}
        style={{ left: `${left}%`, top: `${((marker.string - 0.5) / allStrings.length) * 100}%` }}
        title={`${marker.chordTone ? `${scaleChordToneLabel(marker.chordTone)} chord tone, ` : ""}Scale degree ${marker.degree}: ${marker.note}, fret ${marker.fret}`}
      >
        <span className="text-sm font-black leading-none">
          {labelMode === "notes" ? marker.note : marker.degree === 1 ? "R" : marker.degree}
        </span>
      </div>
    );
  });
}

function buildScaleMarkers(notes: string[], stringGroup: VisualStringGroup, chordRoot?: string): ScaleMarker[] {
  if (notes.length === 0) return [];

  const selectedStrings = stringGroup === "all" ? allStrings : stringsForGroup(stringGroup);
  const chordTones = buildChordToneMap(notes, chordRoot);

  return selectedStrings.flatMap((string) =>
    Array.from({ length: fretboardFretCount + 1 }, (_, fret) => {
      const noteIndex = notes.findIndex(
        (note) => noteToPitchClass(note) === getFrettedPitchClass(string, fret),
      );

      return noteIndex < 0
        ? []
        : [{
          chordTone: chordTones.get(noteIndex) ?? null,
          degree: noteIndex + 1,
          fret,
          note: notes[noteIndex],
          string,
        }];
    }).flat(),
  );
}

function buildChordToneMap(notes: string[], chordRoot?: string): Map<number, ScaleChordTone> {
  if (!chordRoot) return new Map();

  const rootIndex = notes.findIndex((note) => noteToPitchClass(note) === noteToPitchClass(chordRoot));
  if (rootIndex < 0) return new Map();

  return new Map([
    [rootIndex, "root"],
    [(rootIndex + 2) % notes.length, "third"],
    [(rootIndex + 4) % notes.length, "fifth"],
  ]);
}

function scaleChordToneLabel(tone: ScaleChordTone): string {
  return { root: "Root", third: "3rd", fifth: "5th" }[tone];
}
