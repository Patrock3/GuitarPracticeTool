import { useEffect, useMemo, useState } from "react";
import type { MusicalKey } from "../data/keys";
import { findMusicalKey, musicalKeys } from "../data/keys";
import { allStringSets, stringSets } from "../data/stringSets";
import type { StringSet, VisualStringGroup } from "../data/stringSets";
import { AppLayout } from "../components/layout/AppLayout";
import { CombinedTriadFretboard } from "../components/fretboard/CombinedTriadFretboard";
import { ProgressPage } from "../components/progress/ProgressPage";
import { ProgressionBuilder } from "../components/progression/ProgressionBuilder";
import { InteractiveTutorial } from "../components/tutorial/InteractiveTutorial";
import { HarmonisedScale } from "../components/workspace/HarmonisedScale";
import { StringGroupSelector } from "../components/workspace/StringGroupSelector";
import { WelcomeCard } from "../components/workspace/WelcomeCard";
import { buildDiatonicScale } from "../features/harmony/diatonicHarmony";
import type { DiatonicChord } from "../features/harmony/harmonyTypes";
import type { TriadInversion } from "../data/triads";
import type { ProgressionItem } from "../features/progression/progressionTypes";
import { suggestProgressionInversions } from "../features/progression/suggestInversions";
import {
  loadProgress,
  loadWorkspaceState,
  markTargetPractised,
  undoTargetPractice,
  saveProgress,
  saveWorkspaceState,
} from "../features/practice/practiceProgressStorage";
import type { PracticeProgressMap } from "../features/practice/practiceProgressTypes";
import { buildTriadShapes } from "../features/triads/triadTargets";
import type { VisualisationMode } from "../features/visualisation/visualisationTypes";

type Page = "practice" | "progress";

const defaultWorkspace = {
  selectedKey: "C-major",
  selectedDegree: "I",
  selectedStringGroup: "123",
};

export function App() {
  const persistedWorkspace = useMemo(() => loadWorkspaceState(defaultWorkspace), []);
  const [activePage, setActivePage] = useState<Page>("practice");
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [visualisationMode, setVisualisationMode] = useState<VisualisationMode>("triads");
  const [selectedKey, setSelectedKey] = useState<MusicalKey>(
    asMusicalKey(persistedWorkspace.selectedKey),
  );
  const [selectedDegree, setSelectedDegree] = useState(persistedWorkspace.selectedDegree);
  const [selectedStringGroup, setSelectedStringGroup] = useState<VisualStringGroup>(
    asStringGroup(persistedWorkspace.selectedStringGroup),
  );
  const [progress, setProgress] = useState<PracticeProgressMap>(() => loadProgress());

  const chords = useMemo(() => buildDiatonicScale(selectedKey), [selectedKey]);
  const selectedChord = useMemo(
    () => chords.find((chord) => chord.degree === selectedDegree) ?? chords[0],
    [chords, selectedDegree],
  );
  const triadStringGroup: StringSet = selectedStringGroup === "all" ? "123" : selectedStringGroup;
  const triadShapes = useMemo(
    () => buildTriadShapes(selectedChord, triadStringGroup),
    [selectedChord, triadStringGroup],
  );
  const progressByChord = useMemo(
    () => summarizeProgressByChord(chords, progress),
    [chords, progress],
  );

  useEffect(() => {
    saveWorkspaceState({
      selectedKey: selectedKey.id,
      selectedDegree: selectedChord.degree,
      selectedStringGroup,
    });
  }, [selectedChord.degree, selectedKey, selectedStringGroup]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function chooseKey(key: MusicalKey) {
    setSelectedKey(key);
    setSelectedDegree("I");
  }

  function chooseRandomKey() {
    const availableKeys = musicalKeys.filter((key) => key.id !== selectedKey.id);
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    chooseKey(randomKey);
  }

  function chooseChord(chord: DiatonicChord) {
    setSelectedDegree(chord.degree);
  }

  function chooseVisualisationMode(mode: VisualisationMode) {
    setVisualisationMode(mode);
    if (mode === "triads" && selectedStringGroup === "all") setSelectedStringGroup("123");
  }

  function markPractised(targetId: string) {
    setProgress((current) => markTargetPractised(current, targetId));
  }

  function undoPractice(targetId: string) {
    setProgress((current) => undoTargetPractice(current, targetId));
  }

  return (
    <>
      <AppLayout
        activePage={activePage}
        selectedKey={selectedKey}
        onKeyChange={chooseKey}
        onPageChange={setActivePage}
        onRandomKey={chooseRandomKey}
        visualisationMode={visualisationMode}
        onVisualisationModeChange={chooseVisualisationMode}
      >
        {activePage === "practice" ? (
          <PracticeWorkspace
            chords={chords}
            onChordChange={chooseChord}
            onMarkPractised={markPractised}
            onUndoPractice={undoPractice}
            onStringGroupChange={setSelectedStringGroup}
            onStartTutorial={() => setIsTutorialOpen(true)}
            progress={progress}
            progressByChord={progressByChord}
            selectedChord={selectedChord}
            selectedStringGroup={selectedStringGroup}
            shapes={triadShapes}
            visualisationMode={visualisationMode}
          />
        ) : (
          <ProgressPage chords={chords} onKeyChange={chooseKey} progress={progress} />
        )}
      </AppLayout>
      {isTutorialOpen && (
        <InteractiveTutorial
          onClose={() => setIsTutorialOpen(false)}
          onShowPractice={() => setActivePage("practice")}
        />
      )}
    </>
  );
}

interface PracticeWorkspaceProps {
  chords: DiatonicChord[];
  onChordChange: (chord: DiatonicChord) => void;
  onMarkPractised: (targetId: string) => void;
  onUndoPractice: (targetId: string) => void;
  onStringGroupChange: (stringGroup: VisualStringGroup) => void;
  onStartTutorial: () => void;
  progress: PracticeProgressMap;
  progressByChord: Record<string, { practised: number; total: number }>;
  selectedChord: DiatonicChord;
  selectedStringGroup: VisualStringGroup;
  shapes: ReturnType<typeof buildTriadShapes>;
  visualisationMode: VisualisationMode;
}

function PracticeWorkspace({
  chords,
  onChordChange,
  onMarkPractised,
  onUndoPractice,
  onStringGroupChange,
  onStartTutorial,
  progress,
  progressByChord,
  selectedChord,
  selectedStringGroup,
  shapes,
  visualisationMode,
}: PracticeWorkspaceProps) {
  const [progression, setProgression] = useState<ProgressionItem[]>([]);
  const [clearedProgression, setClearedProgression] = useState<ProgressionItem[] | null>(null);
  const [preSuggestionProgression, setPreSuggestionProgression] = useState<ProgressionItem[] | null>(null);
  const [nextProgressionId, setNextProgressionId] = useState(1);
  const fretboardShapes = useMemo(
    () => selectedStringGroup === "all"
      ? stringSets.flatMap((stringGroup) => buildTriadShapes(selectedChord, stringGroup))
      : shapes,
    [selectedChord, selectedStringGroup, shapes],
  );
  const progressionShapes = useMemo(() => progression.flatMap((item) => {
    const shape = buildTriadShapes(item.chord, selectedStringGroup === "all" ? "123" : selectedStringGroup).find((candidate) => candidate.inversion === item.inversion);
    return shape ? [{ ...item, shape }] : [];
  }), [progression, selectedStringGroup]);

  function addToProgression(chord: DiatonicChord, inversion: TriadInversion) {
    setProgression((current) => [...current, { id: nextProgressionId, chord, inversion }]);
    setClearedProgression(null);
    setPreSuggestionProgression(null);
    setNextProgressionId((current) => current + 1);
  }

  function clearProgression() {
    setClearedProgression(progression);
    setPreSuggestionProgression(null);
    setProgression([]);
  }

  function undoClearProgression() {
    if (!clearedProgression) return;
    setProgression(clearedProgression);
    setClearedProgression(null);
    setPreSuggestionProgression(null);
  }

  function removeFromProgression(id: number) {
    setClearedProgression(null);
    setPreSuggestionProgression(null);
    setProgression((current) => current.filter((item) => item.id !== id));
  }

  function updateProgressionItem(id: number, chord: DiatonicChord, inversion: TriadInversion) {
    setClearedProgression(null);
    setPreSuggestionProgression(null);
    setProgression((current) => current.map((item) => item.id === id ? { ...item, chord, inversion } : item));
  }

  function reorderProgression(draggedId: number, targetId: number) {
    setClearedProgression(null);
    setPreSuggestionProgression(null);
    setProgression((current) => {
      const fromIndex = current.findIndex((item) => item.id === draggedId);
      const toIndex = current.findIndex((item) => item.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const reordered = [...current];
      const [dragged] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, dragged);
      return reordered;
    });
  }

  function suggestInversions() {
    setPreSuggestionProgression(progression);
    setProgression(suggestProgressionInversions(progression, selectedStringGroup === "all" ? "123" : selectedStringGroup));
  }

  function undoSuggestion() {
    if (!preSuggestionProgression) return;
    setProgression(preSuggestionProgression);
    setPreSuggestionProgression(null);
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <WelcomeCard onStartTutorial={onStartTutorial} />
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
          <HarmonisedScale
            chords={chords}
            onSelect={onChordChange}
            progressByChord={progressByChord}
            selectedChordId={selectedChord.id}
          />
          <StringGroupSelector
            selectedStringGroup={selectedStringGroup}
            onChange={onStringGroupChange}
            options={visualisationMode === "scale" ? allStringSets : stringSets}
            onIncrement={(shape) => onMarkPractised(shape.id)}
            onDecrement={(shape) => onUndoPractice(shape.id)}
            progress={progress}
            shapes={shapes}
            showInversionProgress={visualisationMode === "triads"}
          />
        </div>
      </section>

      <section className="min-w-0">
        <CombinedTriadFretboard
          progression={visualisationMode === "triads" ? progressionShapes : []}
          renderMode={visualisationMode}
          scaleNotes={chords.map((chord) => chord.root)}
          scaleChordRoot={selectedChord.root}
          scaleRoot={chords[0].root}
          scaleStringGroup={selectedStringGroup}
          shapes={fretboardShapes}
        />
      </section>
      {visualisationMode === "triads" && <ProgressionBuilder
        canUndoClear={clearedProgression !== null}
        canUndoSuggestion={preSuggestionProgression !== null}
        chords={chords}
        items={progression}
        onAdd={addToProgression}
        onClear={clearProgression}
        onRemove={removeFromProgression}
        onReorder={reorderProgression}
        onSuggestInversions={suggestInversions}
        onUndoClear={undoClearProgression}
        onUndoSuggestion={undoSuggestion}
        onUpdate={updateProgressionItem}
      />}
    </div>
  );
}

function summarizeProgressByChord(chords: DiatonicChord[], progress: PracticeProgressMap) {
  return chords.reduce<Record<string, { practised: number; total: number }>>((summary, chord) => {
    const practised = Object.values(progress).filter(
      (record) => record.targetId.startsWith(`${chord.key}:${chord.degree}:`) && record.status === "practised",
    ).length;

    summary[chord.degree] = {
      practised,
      total: 12,
    };

    return summary;
  }, {});
}

function asMusicalKey(value: string): MusicalKey {
  return findMusicalKey(value);
}

function asStringGroup(value: string): VisualStringGroup {
  // The application boots in Triads mode, where the all-strings option is intentionally unavailable.
  return ["123", "234", "345", "456"].includes(value) ? (value as StringSet) : "123";
}
