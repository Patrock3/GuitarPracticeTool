import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { StringGroup } from "../../data/stringSets";
import { stringSets } from "../../data/stringSets";
import type { DiatonicChord } from "../../features/harmony/harmonyTypes";
import type { PracticeProgressMap } from "../../features/practice/practiceProgressTypes";
import { getInversionProgress, getPracticeHistory, summarizeChordStringGroup } from "../../features/practice/progressSummary";
import type { PracticeLedgerEntry } from "../../features/practice/progressSummary";

interface ProgressPageProps {
  chords: DiatonicChord[];
  progress: PracticeProgressMap;
}

interface SelectedCell {
  chord: DiatonicChord;
  stringGroup: StringGroup;
}

export function ProgressPage({ chords, progress }: ProgressPageProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(() => ({
    chord: chords[0],
    stringGroup: "123",
  }));
  const inversionRows = useMemo(
    () => getInversionProgress(selectedCell.chord, selectedCell.stringGroup, progress),
    [progress, selectedCell],
  );
  const practiceHistory = useMemo(
    () => getPracticeHistory(selectedCell.chord, selectedCell.stringGroup, progress),
    [progress, selectedCell],
  );
  const groupedHistory = useMemo(() => groupHistoryByDate(practiceHistory), [practiceHistory]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-xl font-black text-zinc-950">
            Progress database
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700 ring-1 ring-inset ring-amber-200">
              Beta
            </span>
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Counts show total practices across the three inversions for each chord and string group.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-zinc-200 p-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Chord
                </th>
                {stringSets.map((stringGroup) => (
                  <th
                    className="border-b border-zinc-200 p-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"
                    key={stringGroup}
                  >
                    {stringGroup}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chords.map((chord) => (
                <tr key={chord.id}>
                  <th className="border-b border-zinc-100 p-3 text-left">
                    <span className="block text-lg font-black text-zinc-950">{chord.symbol}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                      {chord.degree}
                      {chord.quality === "diminished" ? "dim" : ""}
                    </span>
                  </th>
                  {stringSets.map((stringGroup) => {
                    const summary = summarizeChordStringGroup(chord, stringGroup, progress);
                    const isSelected =
                      selectedCell.chord.id === chord.id &&
                      selectedCell.stringGroup === stringGroup;

                    return (
                      <td className="border-b border-zinc-100 p-2" key={stringGroup}>
                        <button
                          className={`h-16 w-full rounded-md text-lg font-black transition ${
                            isSelected
                              ? "bg-teal-700 text-white"
                              : summary.practiceCount > 0
                                ? "bg-teal-50 text-teal-900 hover:bg-teal-100"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                          }`}
                          onClick={() => setSelectedCell({ chord, stringGroup })}
                        >
                          {summary.practiceCount}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 bg-zinc-50/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Practice journal</p>
          <h3 className="mt-1 text-2xl font-black text-zinc-950">
            {selectedCell.chord.symbol} <span className="mx-1 text-zinc-300">•</span>{" "}
            <span className="text-base font-bold text-zinc-500">Strings {selectedCell.stringGroup}</span>
          </h3>
          <dl className="mt-4 grid grid-cols-3 gap-2">
          {inversionRows.map((row) => (
            <div className="rounded-md border border-zinc-200 bg-white px-3 py-2" key={row.inversion}>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{shortInversionLabel(row.inversion)}</dt>
              <dd className="mt-0.5 text-2xl font-black tabular-nums text-zinc-950">{row.practiceCount}</dd>
            </div>
          ))}
          </dl>
        </div>

        <div className="p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Practice history</h4>
          {groupedHistory.length === 0 ? (
            <p className="mt-5 rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              No journal entries yet. Your next +1 will appear here.
            </p>
          ) : (
            <div className="mt-4 grid max-h-[560px] gap-5 overflow-y-auto pr-1">
              {groupedHistory.map((group) => (
                <section key={group.dateKey}>
                  <h5 className="mb-2 text-sm font-black text-zinc-800">{formatHistoryDate(group.dateKey)}</h5>
                  <ol className="grid gap-1">
                    {group.entries.map((entry, index) => (
                      <li className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50" key={`${entry.practisedAt}-${index}`}>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700"><Check size={13} strokeWidth={3} /></span>
                        <span className="flex-1 font-semibold text-zinc-700">{shortInversionLabel(entry.inversion)}</span>
                        <time className="text-xs tabular-nums text-zinc-400" dateTime={entry.practisedAt}>
                          {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(entry.practisedAt))}
                        </time>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function shortInversionLabel(inversion: PracticeLedgerEntry["inversion"]): string {
  return { root: "Root", first: "1st", second: "2nd" }[inversion];
}

function groupHistoryByDate(entries: PracticeLedgerEntry[]) {
  const groups = new Map<string, PracticeLedgerEntry[]>();
  entries.forEach((entry) => {
    const dateKey = localDateKey(new Date(entry.practisedAt));
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), entry]);
  });
  return Array.from(groups, ([dateKey, groupedEntries]) => ({ dateKey, entries: groupedEntries }));
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatHistoryDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const today = new Date();
  const todayKey = localDateKey(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (dateKey === todayKey) return "Today";
  if (dateKey === localDateKey(yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date);
}
