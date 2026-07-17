export type PracticeTargetType = "triad-inversion";
export type PracticeStatus = "new" | "started" | "practised";

export interface PracticeProgress {
  targetId: string;
  targetType: PracticeTargetType;
  practisedCount: number;
  totalSeconds: number;
  lastPractisedAt: string | null;
  status: PracticeStatus;
  history?: PracticeHistoryEntry[];
}

export interface PracticeHistoryEntry {
  practisedAt: string;
}

export type PracticeProgressMap = Record<string, PracticeProgress>;
export type ChordPracticeTimeMap = Record<string, number>;

export interface WorkspaceState {
  selectedKey: string;
  selectedDegree: string;
  selectedStringGroup: string;
}
