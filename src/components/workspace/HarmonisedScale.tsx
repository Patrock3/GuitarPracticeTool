import type { DiatonicChord } from "../../features/harmony/harmonyTypes";
import { buildChordTones } from "../../features/triads/triadTheory";

interface HarmonisedScaleProps {
  chords: DiatonicChord[];
  selectedChordId: string;
  progressByChord: Record<string, { practised: number; total: number }>;
  onSelect: (chord: DiatonicChord) => void;
}

export function HarmonisedScale({
  chords,
  onSelect,
  progressByChord,
  selectedChordId,
}: HarmonisedScaleProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
          Harmonised scale
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {chords.map((chord) => {
          const isSelected = chord.id === selectedChordId;
          const progress = progressByChord[chord.degree] ?? { practised: 0, total: 12 };
          const tones = isSelected ? buildChordTones(chord.root, chord.quality) : [];

          return (
            <div className="min-w-0" key={chord.id}>
              <button
                className={`min-h-24 w-full rounded-md border p-3 text-left transition ${
                  isSelected
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-teal-500"
                }`}
                onClick={() => onSelect(chord)}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-75">
                  {chord.degree}
                  {chord.quality === "diminished" ? "dim" : ""}
                </span>
                <span className="mt-1 block text-2xl font-black">{chord.symbol}</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  {progress.practised}/{progress.total}
                </span>
              </button>
              {isSelected && (
                <div className="mx-2 mt-3 grid gap-1.5 border-l-2 border-teal-200 py-0.5 pl-3 text-xs font-semibold leading-snug text-zinc-500">
                  {tones.map((tone) => (
                    <span className="grid grid-cols-[1.75rem_1fr] items-baseline" key={tone.interval}>
                      <span className="font-bold tabular-nums text-teal-700/70">{formatAccidentals(tone.interval)}</span>
                      <span className="text-zinc-600">{formatAccidentals(tone.note)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatAccidentals(value: string): string {
  return value.replace(/b/g, "♭").replace(/#/g, "♯");
}
