import { RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TriadInversion } from "../../data/triads";
import { triadInversions } from "../../data/triads";
import type { DiatonicChord } from "../../features/harmony/harmonyTypes";
import type { ProgressionItem } from "../../features/progression/progressionTypes";
import { sequenceNumber } from "../../features/progression/progressionFormat";

interface ProgressionBuilderProps {
  chords: DiatonicChord[];
  items: ProgressionItem[];
  onAdd: (chord: DiatonicChord, inversion: TriadInversion) => void;
  onClear: () => void;
  onRemove: (id: number) => void;
  canUndoClear: boolean;
  onUndoClear: () => void;
  canUndoSuggestion: boolean;
  onSuggestInversions: () => void;
  onUndoSuggestion: () => void;
  onUpdate: (id: number, chord: DiatonicChord, inversion: TriadInversion) => void;
  onReorder: (draggedId: number, targetId: number) => void;
}

const inversionLabels: Record<TriadInversion, string> = { root: "Root", first: "1st", second: "2nd" };

export function ProgressionBuilder({ canUndoClear, canUndoSuggestion, chords, items, onAdd, onClear, onRemove, onReorder, onSuggestInversions, onUndoClear, onUndoSuggestion, onUpdate }: ProgressionBuilderProps) {
  const [chordId, setChordId] = useState(chords[0].id);
  const [inversion, setInversion] = useState<TriadInversion>("root");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const editingItem = items.find((item) => item.id === editingId);
  const availableChords = editingItem && !chords.some((chord) => chord.id === editingItem.chord.id)
    ? [editingItem.chord, ...chords]
    : chords;
  const selectedChord = availableChords.find((chord) => chord.id === chordId) ?? availableChords[0];

  useEffect(() => {
    if (editingId !== null && !items.some((item) => item.id === editingId)) setEditingId(null);
  }, [editingId, items]);

  function beginEditing(item: ProgressionItem) {
    setEditingId(item.id);
    setChordId(item.chord.id);
    setInversion(item.inversion);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function submit() {
    if (editingId === null) onAdd(selectedChord, inversion);
    else {
      onUpdate(editingId, selectedChord, inversion);
      setEditingId(null);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-zinc-800">Progression Builder</h2>
          <p className="mt-1 text-xs text-zinc-500">Choose each chord and inversion manually.</p>
        </div>
        {items.length === 0 && canUndoClear && (
          <button className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800" onClick={onUndoClear} type="button">
            <RotateCcw size={13} /> Undo
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-zinc-100 py-4">
          <ol className="flex min-w-0 flex-wrap gap-2" aria-label="Current chord progression">
            {items.map((item, index) => (
              <li
                className={`flex cursor-grab items-center rounded-full border py-1.5 pl-1 pr-1.5 text-sm font-semibold transition active:cursor-grabbing ${editingId === item.id ? "border-teal-500 bg-teal-50 text-teal-950 ring-2 ring-teal-100" : draggedId === item.id ? "border-zinc-300 bg-zinc-100 opacity-50" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300"}`}
                draggable
                key={item.id}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggedId(item.id)}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedId !== null && draggedId !== item.id) onReorder(draggedId, item.id);
                  setDraggedId(null);
                }}
              >
                <button className="flex items-center gap-2 rounded-full py-0.5 pl-2 pr-1 text-left" onClick={() => beginEditing(item)} type="button">
                  <span className="font-black text-teal-700">{sequenceNumber(index)}</span>
                  <span>{item.chord.symbol}</span>
                  <span className="text-xs text-zinc-400">{inversionLabels[item.inversion]}</span>
                </button>
                <button aria-label={`Remove ${item.chord.symbol} ${inversionLabels[item.inversion]}`} className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700" onClick={() => onRemove(item.id)} type="button"><X size={13} /></button>
              </li>
            ))}
          </ol>
          <div className="flex shrink-0 items-center gap-2" aria-label="Progression actions">
            <button
              className={`h-9 rounded-md border px-3 text-xs font-bold transition ${canUndoSuggestion ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100" : "border-zinc-300 bg-white text-zinc-600 hover:border-teal-400 hover:text-teal-800"}`}
              onClick={canUndoSuggestion ? onUndoSuggestion : onSuggestInversions}
              type="button"
            >
              {canUndoSuggestion ? "Undo Suggestion" : "Suggest Inversions"}
            </button>
            <button className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700" onClick={onClear} type="button">
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
          Chord
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-bold normal-case tracking-normal text-zinc-900" value={selectedChord.id} onChange={(event) => setChordId(event.target.value)}>
            {availableChords.map((chord) => <option value={chord.id} key={chord.id}>{chord.degree} · {chord.symbol}</option>)}
          </select>
        </label>
        <label className="grid flex-1 gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
          Inversion
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-bold normal-case tracking-normal text-zinc-900" value={inversion} onChange={(event) => setInversion(event.target.value as TriadInversion)}>
            {triadInversions.map((value) => <option value={value} key={value}>{inversionLabels[value]}</option>)}
          </select>
        </label>
        <div className="flex gap-2">
          {editingId !== null && (
            <button className="h-10 rounded-md px-3 text-sm font-bold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800" onClick={cancelEditing} type="button">
              Cancel
            </button>
          )}
          <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-bold text-white transition hover:bg-teal-800" onClick={submit} type="button">
            {editingId === null ? "Add to Progression" : "Update"}
          </button>
        </div>
      </div>
    </section>
  );
}
