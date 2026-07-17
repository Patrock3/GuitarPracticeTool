import type { VisualStringGroup } from "../../data/stringSets";
import { getFrettedPitchClass } from "../../features/fretboard/standardTuning";
import { noteToPitchClass } from "../../features/fretboard/noteMath";
import { stringsForGroup } from "../../features/triads/triadTargets";
import type { FretboardLabelMode } from "./FretboardMarkerLabel";

interface ScaleFretboardViewProps {
  labelMode: FretboardLabelMode;
  notes: string[];
  root: string;
  stringGroup: VisualStringGroup;
  headerControls?: ReactNode;
}

const allStrings = [1, 2, 3, 4, 5, 6];
const maxFret = 15;
const positionFrets = [3, 5, 7, 9, 12];

export function ScaleFretboardView({ headerControls, labelMode, notes, root, stringGroup }: ScaleFretboardViewProps) {
  const selectedStrings = stringGroup === "all" ? ([1, 2, 3, 4, 5, 6] as const) : stringsForGroup(stringGroup);
  const rootIndex = Math.max(0, notes.findIndex((note) => noteToPitchClass(note) === noteToPitchClass(root)));
  const scaleMarkers = selectedStrings.flatMap((string) =>
    Array.from({ length: maxFret + 1 }, (_, fret) => {
      const noteIndex = notes.findIndex((note) => noteToPitchClass(note) === getFrettedPitchClass(string, fret));
      if (noteIndex < 0) return [];
      return [{ string, fret, note: notes[noteIndex], degree: ((noteIndex - rootIndex + notes.length) % notes.length) + 1 }];
    }).flat(),
  );

  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Scale map</p>
          <h3 className="mt-1 text-2xl font-black text-zinc-950">
            {root} scale view <span className="font-semibold text-zinc-400">/ {stringGroup === "all" ? "all strings" : `strings ${stringGroup}`}</span>
          </h3>
          <p className="mt-1 text-xs text-zinc-400">Complete parent scale · degrees shown from {root}</p>
        </div>
        {headerControls}
      </div>
      <div className="px-1 pb-2 sm:px-4">
        <div className="relative ml-7 sm:ml-10">
          <div className="fretboard relative h-[250px] w-full rounded-r-lg sm:h-[300px]" aria-label={`${root} scale fretboard diagram`}>
            <div className="absolute inset-y-0 left-0 z-10 w-[5px] bg-[#302a24] shadow-[2px_0_3px_rgba(0,0,0,0.25)]" aria-hidden="true" />
            {Array.from({ length: maxFret }, (_, index) => index + 1).map((fret) => (
              <div className="absolute inset-y-0 border-r border-[#5d4935]/35" key={fret} style={{ left: `${((fret - 1) / maxFret) * 100}%`, width: `${100 / maxFret}%` }} aria-hidden="true" />
            ))}
            {positionFrets.map((fret) => (
              <div className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-10 opacity-20" key={fret} style={{ left: `${((fret - 0.5) / maxFret) * 100}%` }} aria-hidden="true">
                {(fret === 12 ? [0, 1] : [0]).map((dot) => <span className="block h-2.5 w-2.5 rounded-full bg-[#382b20] sm:h-3 sm:w-3" key={dot} />)}
              </div>
            ))}
            {allStrings.map((string) => (
              <div className="absolute left-0 right-0 z-[2] -translate-y-1/2 rounded-full bg-[#272522] shadow-[0_1px_1px_rgba(255,255,255,0.25)]" key={string} style={{ top: `${((string - 0.5) / allStrings.length) * 100}%`, height: `${1.25 + string * 0.28}px` }} aria-hidden="true" />
            ))}
            {allStrings.map((string) => (
              <span className="absolute right-[calc(100%+0.65rem)] z-20 -translate-y-1/2 text-[10px] font-bold text-zinc-400" key={`label-${string}`} style={{ top: `${((string - 0.5) / allStrings.length) * 100}%` }}>{string}</span>
            ))}
            {scaleMarkers.map((marker) => {
              const left = marker.fret === 0 ? 0 : ((marker.fret - 0.5) / maxFret) * 100;
              return (
                <div className={`absolute z-20 flex h-[clamp(2.25rem,3.5vw,3rem)] w-[clamp(2.25rem,3.5vw,3rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-white/90 text-white shadow-[0_3px_8px_rgba(30,24,18,0.3)] ${marker.degree === 1 ? "bg-teal-800" : "bg-zinc-700"}`} key={`${marker.string}-${marker.fret}`} style={{ left: `${left}%`, top: `${((marker.string - 0.5) / allStrings.length) * 100}%` }} title={`${marker.degree} ${marker.note}, fret ${marker.fret}`}>
                  {labelMode === "tab" ? (
                    <span className="text-sm font-black tabular-nums">{marker.fret}</span>
                  ) : (
                    <><span className="text-xs font-black leading-none">{marker.degree}</span><span className="mt-0.5 text-[10px] font-bold leading-none opacity-90">{marker.note}</span></>
                  )}
                </div>
              );
            })}
          </div>
          <div className="relative mt-3 h-5" aria-label="Fret numbers">
            {Array.from({ length: maxFret }, (_, index) => index + 1).map((fret) => <span className="absolute -translate-x-1/2 text-[10px] font-semibold tabular-nums text-zinc-400" key={fret} style={{ left: `${((fret - 0.5) / maxFret) * 100}%` }}>{fret}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}
import type { ReactNode } from "react";
