import { useEffect, useState } from "react";
import { triadInversionLabels } from "../../data/triads";
import type { FretMarker, TriadShape } from "../../features/triads/triadTypes";
import type { ProgressionShape } from "../../features/progression/progressionTypes";
import { sequenceNumber } from "../../features/progression/progressionFormat";
import { FretboardMarkerLabel } from "./FretboardMarkerLabel";
import type { FretboardLabelMode } from "./FretboardMarkerLabel";
import { ScaleFretboardView } from "./ScaleFretboardView";
import type { VisualisationMode } from "../../features/visualisation/visualisationTypes";
import type { VisualStringGroup } from "../../data/stringSets";
import { fretboardFretCount } from "./fretboardLayout";

interface CombinedTriadFretboardProps {
  shapes: TriadShape[];
  progression?: ProgressionShape[];
  renderMode?: VisualisationMode;
  scaleNotes?: string[];
  scaleRoot?: string;
  scaleStringGroup?: VisualStringGroup;
}

const inversionStyles = {
  root: { marker: "bg-teal-800", shortLabel: "Root" },
  first: { marker: "bg-amber-600", shortLabel: "1st" },
  second: { marker: "bg-rose-700", shortLabel: "2nd" },
};

const strings = [1, 2, 3, 4, 5, 6];
const positionFrets = [3, 5, 7, 9, 12];
const progressionColours = ["bg-teal-800", "bg-indigo-700", "bg-rose-700", "bg-amber-700", "bg-sky-700", "bg-violet-700", "bg-emerald-700", "bg-orange-700"];

interface CombinedMarker extends FretMarker {
  shape: TriadShape;
  stackIndex: number;
  stackTotal: number;
  progressionIndex: number | null;
}

export function CombinedTriadFretboard({ progression = [], renderMode = "triads", scaleNotes = [], scaleRoot, scaleStringGroup, shapes }: CombinedTriadFretboardProps) {
  const [focusedProgressionId, setFocusedProgressionId] = useState<number | null>(null);
  const [labelMode, setLabelMode] = useState<FretboardLabelMode>("notes");

  useEffect(() => {
    if (progression.length === 0) {
      setFocusedProgressionId(null);
      return;
    }
    if (!progression.some((item) => item.id === focusedProgressionId)) {
      setFocusedProgressionId(progression[0].id);
    }
  }, [focusedProgressionId, progression]);

  if (shapes.length === 0) {
    return (
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
        No validated closed-position shapes are available for this chord and string group yet.
      </section>
    );
  }

  if (renderMode === "scale") {
    return (
      <section className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <ScaleFretboardView
          headerControls={<LabelModeToggle labelMode={labelMode} onChange={setLabelMode} />}
          labelMode={labelMode}
          notes={scaleNotes}
          root={scaleRoot ?? shapes[0].chord.root}
          selectedChord={shapes[0].chord}
          stringGroup={scaleStringGroup ?? shapes[0].stringGroup}
        />
      </section>
    );
  }

  const isProgression = progression.length > 0;
  const displayedShapes = isProgression ? progression.map((item) => item.shape) : shapes;
  const rawMarkers = displayedShapes.flatMap((shape, progressionIndex) =>
    shape.markers.map((marker) => ({ ...marker, shape, progressionIndex: isProgression ? progressionIndex : null })),
  );
  const groupedMarkers = rawMarkers.reduce<Map<string, typeof rawMarkers>>((groups, marker) => {
    const key = `${marker.string}-${marker.fret}`;
    groups.set(key, [...(groups.get(key) ?? []), marker]);
    return groups;
  }, new Map());
  const markers: CombinedMarker[] = Array.from(groupedMarkers.values()).flatMap((group) =>
    group.map((marker, stackIndex) => ({ ...marker, stackIndex, stackTotal: group.length })),
  ).filter((marker) => marker.fret <= fretboardFretCount);
  const visiblePositionFrets = positionFrets.filter((fret) => fret <= fretboardFretCount);

  return (
    <section className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Fretboard View</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <h3 className="text-2xl font-black text-zinc-950">
              {isProgression ? progression.map((item) => item.chord.symbol).join(" → ") : shapes[0].chord.symbol} <span className="font-semibold text-zinc-400">/ strings {shapes[0].stringGroup}</span>
            </h3>
            {!isProgression && (
              <div className="flex shrink-0 items-center gap-3" aria-label="Inversion colour legend">
                {shapes.map((shape) => (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500" key={shape.id}>
                    <span className={`h-2.5 w-2.5 rounded-full ${inversionStyles[shape.inversion].marker}`} aria-hidden="true" />
                    {inversionStyles[shape.inversion].shortLabel}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isProgression && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Progression sequence">
              {progression.map((item, index) => {
                const isFocused = item.id === focusedProgressionId;
                return (
                  <div className="flex items-center gap-1.5" key={item.id}>
                    {index > 0 && <span className="text-sm text-zinc-300" aria-hidden="true">→</span>}
                    <button
                      aria-pressed={isFocused}
                      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${isFocused ? "border-zinc-300 bg-zinc-100 text-zinc-900 shadow-sm" : "border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50"}`}
                      onClick={() => setFocusedProgressionId(item.id)}
                      type="button"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${progressionColours[index % progressionColours.length]}`} aria-hidden="true" />
                      {item.chord.symbol} {inversionStyles[item.inversion].shortLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <LabelModeToggle labelMode={labelMode} onChange={setLabelMode} />
      </div>

      <div className="px-1 pb-2 sm:px-4">
        <div className="relative ml-7 sm:ml-10">
          <div className="fretboard relative h-[250px] w-full rounded-r-lg sm:h-[300px]" aria-label={isProgression ? "Chord progression fretboard diagram" : `${shapes[0].chord.symbol} fretboard diagram`}>
            <div className="absolute inset-y-0 left-0 z-10 w-[5px] bg-[#302a24] shadow-[2px_0_3px_rgba(0,0,0,0.25)]" aria-hidden="true" />

            {Array.from({ length: fretboardFretCount }, (_, index) => index + 1).map((fret) => (
              <div
                className="absolute inset-y-0 border-r border-[#5d4935]/35"
                key={fret}
                style={{ left: `${((fret - 1) / fretboardFretCount) * 100}%`, width: `${100 / fretboardFretCount}%` }}
                aria-hidden="true"
              />
            ))}

            {visiblePositionFrets.map((fret) => (
              <div
                className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-10 opacity-20"
                key={fret}
                style={{ left: `${((fret - 0.5) / fretboardFretCount) * 100}%` }}
                aria-hidden="true"
              >
                {(fret === 12 ? [0, 1] : [0]).map((dot) => (
                  <span className="block h-2.5 w-2.5 rounded-full bg-[#382b20] sm:h-3 sm:w-3" key={dot} />
                ))}
              </div>
            ))}

            {strings.map((string) => (
              <div
                className="absolute left-0 right-0 z-[2] -translate-y-1/2 rounded-full bg-[#272522] shadow-[0_1px_1px_rgba(255,255,255,0.25)]"
                key={string}
                style={{ top: `${((string - 0.5) / strings.length) * 100}%`, height: `${1.25 + string * 0.28}px` }}
                aria-hidden="true"
              />
            ))}

            {strings.map((string) => (
              <span
                className="absolute right-[calc(100%+0.65rem)] z-20 -translate-y-1/2 text-[10px] font-bold text-zinc-400"
                key={`label-${string}`}
                style={{ top: `${((string - 0.5) / strings.length) * 100}%` }}
              >
                {string}
              </span>
            ))}

            {markers.map((marker) => {
              const stackOffset = (marker.stackIndex - (marker.stackTotal - 1) / 2) * 13;
              const left = marker.fret === 0 ? 0 : ((marker.fret - 0.5) / fretboardFretCount) * 100;
              const markerProgressionItem = marker.progressionIndex === null ? null : progression[marker.progressionIndex];
              const isFaded = markerProgressionItem !== null && markerProgressionItem.id !== focusedProgressionId;
              return (
                <div
                  className={`absolute flex h-[clamp(2.65rem,4.3vw,3.65rem)] w-[clamp(2.65rem,4.3vw,3.65rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-white/90 text-white shadow-[0_3px_8px_rgba(30,24,18,0.38)] transition duration-200 ${isFaded ? "z-10 opacity-[0.45]" : markerProgressionItem ? "z-20 opacity-100 ring-2 ring-zinc-900/15 ring-offset-1" : "z-20 opacity-100"} ${marker.progressionIndex === null ? inversionStyles[marker.shape.inversion].marker : progressionColours[marker.progressionIndex % progressionColours.length]}`}
                  style={{ left: `calc(${left}% + ${stackOffset}px)`, top: `${((marker.string - 0.5) / strings.length) * 100}%` }}
                  key={`${marker.progressionIndex ?? "normal"}-${marker.shape.id}-${marker.string}-${marker.fret}`}
                  title={`${marker.shape.chord.symbol} ${triadInversionLabels[marker.shape.inversion]}: ${marker.note} ${marker.interval}`}
                >
                  <FretboardMarkerLabel marker={marker} mode={labelMode} progressionIndex={marker.progressionIndex} />
                </div>
              );
            })}
          </div>

          <div className="relative mt-3 h-5" aria-label="Fret numbers">
            {Array.from({ length: fretboardFretCount }, (_, index) => index + 1).map((fret) => (
              <span
                className="absolute -translate-x-1/2 text-[10px] font-semibold tabular-nums text-zinc-400"
                key={fret}
                style={{ left: `${((fret - 0.5) / fretboardFretCount) * 100}%` }}
              >
                {fret}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LabelModeToggle({ labelMode, onChange }: { labelMode: FretboardLabelMode; onChange: (mode: FretboardLabelMode) => void }) {
  return (
    <fieldset className="flex items-center gap-2" aria-label="Fretboard label mode">
      <legend className="sr-only">Labels</legend>
      <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
        {(["notes", "tab"] as const).map((mode) => (
          <button aria-pressed={labelMode === mode} className={`rounded px-2.5 py-1 text-xs font-bold transition ${labelMode === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"}`} key={mode} onClick={() => onChange(mode)} type="button">
            {mode === "notes" ? "Notes" : "TAB"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
