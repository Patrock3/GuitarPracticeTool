import type { StringGroup } from "../../data/stringSets";
import { triadInversions } from "../../data/triads";
import type { DiatonicChord } from "../harmony/harmonyTypes";
import type { ChordQuality } from "../harmony/harmonyTypes";
import { formatChordSymbol } from "../harmony/diatonicHarmony";
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
  chord: string;
  chordKey: string;
  chordQuality: ChordQuality;
  chordRoot: string;
  inversion: TriadInversion;
  practisedAt: string;
  stringGroup?: StringGroup;
}

export function getPracticeHistory(progress: PracticeProgressMap): PracticeLedgerEntry[] {
  return Object.values(progress).flatMap((record) => {
    const target = parsePracticeTarget(record.targetId);
    if (!target) return [];

    return (record.history ?? []).map((entry) => ({
      chord: formatChordSymbol(target.root, target.quality),
      chordKey: target.key,
      chordQuality: target.quality,
      chordRoot: target.root,
      inversion: target.inversion,
      practisedAt: entry.practisedAt,
      stringGroup: target.stringGroup,
    }));
  }).sort((left, right) => right.practisedAt.localeCompare(left.practisedAt));
}

function parsePracticeTarget(targetId: string): {
  inversion: TriadInversion;
  key: string;
  quality: ChordQuality;
  root: string;
  stringGroup?: StringGroup;
} | null {
  const [key, , root, quality, stringGroup, inversion] = targetId.split(":");
  if (!key || !root || !isChordQuality(quality) || !isTriadInversion(inversion)) return null;

  return {
    inversion,
    key,
    quality,
    root,
    stringGroup: isStringGroup(stringGroup) ? stringGroup : undefined,
  };
}

function isChordQuality(value: string): value is ChordQuality {
  return value === "major" || value === "minor" || value === "diminished";
}

function isStringGroup(value: string): value is StringGroup {
  return ["123", "234", "345", "456"].includes(value);
}

function isTriadInversion(value: string): value is TriadInversion {
  return triadInversions.includes(value as TriadInversion);
}

function getProgressRecordsForPrefix(progress: PracticeProgressMap, prefix: string): PracticeProgress[] {
  return Object.values(progress).filter((record) => record.targetId.startsWith(prefix));
}
