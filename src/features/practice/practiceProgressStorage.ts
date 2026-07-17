import { readJson, writeJson } from "../../lib/localStorage";
import type {
  ChordPracticeTimeMap,
  PracticeProgress,
  PracticeProgressMap,
  WorkspaceState,
} from "./practiceProgressTypes";

const progressKey = "gpt.triadProgress.v1";
const workspaceKey = "gpt.workspaceState.v1";
const chordTimeKey = "gpt.chordPracticeTime.v1";

export function loadProgress(): PracticeProgressMap {
  return readJson<PracticeProgressMap>(progressKey, {});
}

export function saveProgress(progress: PracticeProgressMap): void {
  writeJson(progressKey, progress);
}

export function loadChordPracticeTime(): ChordPracticeTimeMap {
  return readJson<ChordPracticeTimeMap>(chordTimeKey, {});
}

export function saveChordPracticeTime(chordTime: ChordPracticeTimeMap): void {
  writeJson(chordTimeKey, chordTime);
}

export function addChordPracticeTime(
  chordTime: ChordPracticeTimeMap,
  chordContextId: string,
  elapsedSeconds: number,
): ChordPracticeTimeMap {
  if (elapsedSeconds < 1) {
    return chordTime;
  }

  return {
    ...chordTime,
    [chordContextId]: (chordTime[chordContextId] ?? 0) + elapsedSeconds,
  };
}

export function markTargetPractised(
  progress: PracticeProgressMap,
  targetId: string,
  elapsedSeconds = 0,
): PracticeProgressMap {
  const existing = progress[targetId];
  const practisedAt = new Date().toISOString();
  const next: PracticeProgress = {
    targetId,
    targetType: "triad-inversion",
    practisedCount: (existing?.practisedCount ?? 0) + 1,
    totalSeconds: (existing?.totalSeconds ?? 0) + Math.max(0, elapsedSeconds),
    lastPractisedAt: practisedAt,
    status: "practised",
    history: [...(existing?.history ?? []), { practisedAt }],
  };

  return {
    ...progress,
    [targetId]: next,
  };
}

export function undoTargetPractice(
  progress: PracticeProgressMap,
  targetId: string,
): PracticeProgressMap {
  const existing = progress[targetId];
  if (!existing || existing.practisedCount <= 0) {
    return progress;
  }

  const history = [...(existing.history ?? [])];
  history.pop();
  const practisedCount = Math.max(0, existing.practisedCount - 1);

  return {
    ...progress,
    [targetId]: {
      ...existing,
      practisedCount,
      history,
      lastPractisedAt: history[history.length - 1]?.practisedAt ?? null,
      status: practisedCount === 0 ? "new" : "practised",
    },
  };
}

export function loadWorkspaceState(fallback: WorkspaceState): WorkspaceState {
  return readJson<WorkspaceState>(workspaceKey, fallback);
}

export function saveWorkspaceState(state: WorkspaceState): void {
  writeJson(workspaceKey, state);
}
