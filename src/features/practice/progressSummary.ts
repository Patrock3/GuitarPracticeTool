import type { StringGroup } from "../../data/stringSets";
import { triadInversions } from "../../data/triads";
import type { DiatonicChord } from "../harmony/harmonyTypes";
import type { PracticeProgress, PracticeProgressMap } from "./practiceProgressTypes";
import type { TriadInversion } from "../../data/triads";

export interface ChordStringGroupSummary {
  chord: DiatonicChord;
  stringGroup: StringGroup;
  practiceCount: number;
}

export function getTargetPrefix(chord: DiatonicChord, stringGroup?: StringGroup): string {
  return stringGroup
    ? `${chord.key}:${chord.degree}:${chord.root}:${chord.quality}:${stringGroup}:`
    : `${chord.key}:${chord.degree}:${chord.root}:${chord.quality}:`;
}

export function summarizeChordStringGroup(
  chord: DiatonicChord,
  stringGroup: StringGroup,
  progress: PracticeProgressMap,
): ChordStringGroupSummary {
  const records = getProgressRecordsForPrefix(progress, getTargetPrefix(chord, stringGroup));

  return {
    chord,
    stringGroup,
    practiceCount: records.reduce((sum, record) => sum + record.practisedCount, 0),
  };
}

export function getInversionProgress(
  chord: DiatonicChord,
  stringGroup: StringGroup,
  progress: PracticeProgressMap,
) {
  return triadInversions.map((inversion) => {
    const prefix = `${getTargetPrefix(chord, stringGroup)}${inversion}`;
    const records = getProgressRecordsForPrefix(progress, prefix);
    return {
      inversion,
      practiceCount: records.reduce((sum, record) => sum + record.practisedCount, 0),
    };
  });
}

export interface PracticeLedgerEntry {
  inversion: TriadInversion;
  practisedAt: string;
}

export function getPracticeHistory(
  chord: DiatonicChord,
  stringGroup: StringGroup,
  progress: PracticeProgressMap,
): PracticeLedgerEntry[] {
  return triadInversions.flatMap((inversion) => {
    const prefix = `${getTargetPrefix(chord, stringGroup)}${inversion}`;
    return getProgressRecordsForPrefix(progress, prefix).flatMap((record) =>
      (record.history ?? []).map((entry) => ({ inversion, practisedAt: entry.practisedAt })),
    );
  }).sort((left, right) => right.practisedAt.localeCompare(left.practisedAt));
}

function getProgressRecordsForPrefix(progress: PracticeProgressMap, prefix: string): PracticeProgress[] {
  return Object.values(progress).filter((record) => record.targetId.startsWith(prefix));
}
