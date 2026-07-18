import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { musicalKeys } from "../../data/keys";
import type { MusicalKey } from "../../data/keys";
import type { StringGroup } from "../../data/stringSets";
import { stringGroupColourClasses, stringSets } from "../../data/stringSets";
import type { DiatonicChord } from "../../features/harmony/harmonyTypes";
import type { ChordQuality } from "../../features/harmony/harmonyTypes";
import { buildDiatonicScale } from "../../features/harmony/diatonicHarmony";
import type { PracticeProgressMap } from "../../features/practice/practiceProgressTypes";
import { summarizeLifetimeChordPractice } from "../../features/practice/practiceAnalytics";
import type { LifetimeChordSummary } from "../../features/practice/practiceAnalytics";
import { getInversionProgress, getPracticeHistory, summarizeChordStringGroup } from "../../features/practice/progressSummary";
import type { PracticeLedgerEntry } from "../../features/practice/progressSummary";
import { OverallPracticeSummary } from "./OverallPracticeSummary";

interface ProgressPageProps {
  chords: DiatonicChord[];
  onKeyChange: (key: MusicalKey) => void;
  progress: PracticeProgressMap;
  selectedKey: MusicalKey;
}

interface SelectedCell {
  chord: DiatonicChord;
  stringGroup: StringGroup;
}

export function ProgressPage({ chords, onKeyChange, progress, selectedKey }: ProgressPageProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(() => ({
    chord: chords[0],
    stringGroup: "123",
  }));
  const inversionRows = useMemo(
    () => getInversionProgress(selectedCell.chord, selectedCell.stringGroup, progress),
    [progress, selectedCell],
  );
  const practiceHistory = useMemo(
    () => getPracticeHistory(progress).filter((entry) =>
      entry.chordKey === selectedCell.chord.key
      && entry.chordRoot === selectedCell.chord.root
      && entry.chordQuality === selectedCell.chord.quality
      && entry.stringGroup === selectedCell.stringGroup,
    ),
    [progress, selectedCell],
  );
  const lifetimeSummaries = useMemo(
    () => summarizeLifetimeChordPractice(progress),
    [progress],
  );

  useEffect(() => {
    setSelectedCell((current) => chords.some((chord) => chord.id === current.chord.id)
      ? current
      : { chord: chords[0], stringGroup: current.stringGroup });
  }, [chords]);

  function selectChartSegment(summary: LifetimeChordSummary, stringGroup: StringGroup) {
    const chordInCurrentKey = chords.find((chord) =>
      chord.root === summary.root && chord.quality === summary.quality,
    );
    if (chordInCurrentKey) {
      setSelectedCell({ chord: chordInCurrentKey, stringGroup });
      return;
    }

    const key = findPreferredKey(summary.root, summary.quality, stringGroup, progress);
    if (!key) return;
    const chord = buildDiatonicScale(key).find((candidate) =>
      candidate.root === summary.root && candidate.quality === summary.quality,
    );
    if (!chord) return;

    setSelectedCell({ chord, stringGroup });
    onKeyChange(key);
  }

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-black text-zinc-950">
          Practice Analytics
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700 ring-1 ring-inset ring-amber-200">
            Beta
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Review your lifetime practice patterns and drill into exact counts for the current key.
        </p>
      </header>

      <OverallPracticeSummary
        onSelect={selectChartSegment}
        selectedSegment={{
          summaryId: `${selectedCell.chord.root}:${selectedCell.chord.quality}`,
          stringGroup: selectedCell.stringGroup,
        }}
        summaries={lifetimeSummaries}
      />

      <section className="grid gap-3">
        <div>
          <h2 className="text-xl font-black text-zinc-950">Progress Database</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Current Key: <span className="font-bold text-zinc-800">{formatKeyLabel(selectedKey)}</span>
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-sm text-zinc-600">
                Exact practice counts across the three inversions for each chord and string group.
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
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${stringGroupColourClasses[stringGroup]}`} aria-hidden="true" />
                      {stringGroup}
                    </span>
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
                          aria-pressed={isSelected}
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
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Selected chord</p>
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
          <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Recent Practice</h4>
          {practiceHistory.length === 0 ? (
            <p className="mt-5 rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              No practice recorded for this chord and string group yet.
            </p>
          ) : (
            <ol className="mt-4 grid max-h-[560px] gap-1 overflow-y-auto pr-1">
              {practiceHistory.map((entry, index) => (
                <li className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-zinc-50" key={`${entry.practisedAt}-${entry.chord}-${entry.inversion}-${index}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700"><Check size={13} strokeWidth={3} /></span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-zinc-700">
                    <span className="font-black text-zinc-900">{entry.chord}</span>
                    <span className="mx-1.5 text-zinc-300">•</span>
                    {shortInversionLabel(entry.inversion)}
                    {entry.stringGroup && (
                      <>
                        <span className="mx-1.5 text-zinc-300">•</span>
                        Strings {entry.stringGroup}
                      </>
                    )}
                  </span>
                  <time className="shrink-0 text-xs tabular-nums text-zinc-400" dateTime={entry.practisedAt}>
                    {formatHistoryTimestamp(entry.practisedAt)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
        </div>
      </section>
    </div>
  );
}

function formatKeyLabel(key: MusicalKey): string {
  return `${key.tonic} ${key.quality === "major" ? "Major" : "Minor"}`;
}

function findPreferredKey(
  root: string,
  quality: ChordQuality,
  stringGroup: StringGroup,
  progress: PracticeProgressMap,
): MusicalKey | null {
  const countsByKey = new Map<string, number>();

  Object.values(progress).forEach((record) => {
    const [keyId, , targetRoot, targetQuality, targetStringGroup] = record.targetId.split(":");
    if (targetRoot !== root || targetQuality !== quality || targetStringGroup !== stringGroup) return;
    countsByKey.set(keyId, (countsByKey.get(keyId) ?? 0) + Math.max(0, record.practisedCount));
  });

  const practicedKeys = Array.from(countsByKey.entries())
    .sort((left, right) => right[1] - left[1])
    .flatMap(([keyId]) => {
      const key = musicalKeys.find((candidate) => candidate.id === keyId);
      return key ? [key] : [];
    });
  const compatibleKeys = musicalKeys.filter((key) =>
    buildDiatonicScale(key).some((chord) => chord.root === root && chord.quality === quality),
  );

  return practicedKeys.find((key) => compatibleKeys.some((candidate) => candidate.id === key.id))
    ?? compatibleKeys[0]
    ?? null;
}

function shortInversionLabel(inversion: PracticeLedgerEntry["inversion"]): string {
  return { root: "Root", first: "1st", second: "2nd" }[inversion];
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatHistoryTimestamp(practisedAt: string): string {
  const date = new Date(practisedAt);
  const today = new Date();
  const dateKey = localDateKey(date);
  const todayKey = localDateKey(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);

  if (dateKey === todayKey) return `Today ${time}`;
  if (dateKey === localDateKey(yesterday)) return `Yesterday ${time}`;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfEntryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const ageInDays = Math.floor((startOfToday.getTime() - startOfEntryDate.getTime()) / 86_400_000);

  if (ageInDays >= 0 && ageInDays < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}
