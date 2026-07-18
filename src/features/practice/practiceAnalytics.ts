import { stringSets } from "../../data/stringSets";
import type { StringGroup } from "../../data/stringSets";
import type { ChordQuality } from "../harmony/harmonyTypes";
import { formatChordSymbol } from "../harmony/diatonicHarmony";
import type { PracticeProgressMap } from "./practiceProgressTypes";

export interface LifetimeChordSummary {
  id: string;
  root: string;
  quality: ChordQuality;
  symbol: string;
  stringGroups: Record<StringGroup, number>;
  total: number;
}

export function summarizeLifetimeChordPractice(
  progress: PracticeProgressMap,
): LifetimeChordSummary[] {
  const summaries = new Map<string, LifetimeChordSummary>();

  Object.values(progress).forEach((record) => {
    const target = parsePracticeTarget(record.targetId);
    if (!target) return;

    const id = `${target.root}:${target.quality}`;
    const summary = summaries.get(id) ?? {
      id,
      root: target.root,
      quality: target.quality,
      symbol: formatChordSymbol(target.root, target.quality),
      stringGroups: emptyStringGroupCounts(),
      total: 0,
    };
    const practiceCount = Math.max(0, record.practisedCount);

    summary.stringGroups[target.stringGroup] += practiceCount;
    summary.total += practiceCount;
    summaries.set(id, summary);
  });

  return Array.from(summaries.values()).sort(
    (left, right) => right.total - left.total || left.symbol.localeCompare(right.symbol),
  );
}

function parsePracticeTarget(targetId: string): {
  quality: ChordQuality;
  root: string;
  stringGroup: StringGroup;
} | null {
  const [, , root, quality, stringGroup] = targetId.split(":");
  if (!root || !isChordQuality(quality) || !isStringGroup(stringGroup)) return null;
  return { quality, root, stringGroup };
}

function isChordQuality(value: string): value is ChordQuality {
  return value === "major" || value === "minor" || value === "diminished";
}

function isStringGroup(value: string): value is StringGroup {
  return stringSets.includes(value as StringGroup);
}

function emptyStringGroupCounts(): Record<StringGroup, number> {
  return { "123": 0, "234": 0, "345": 0, "456": 0 };
}
