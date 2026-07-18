import { stringSets } from "../../data/stringSets";
import type { VisualStringGroup } from "../../data/stringSets";
import type { PracticeProgressMap } from "../../features/practice/practiceProgressTypes";
import type { TriadShape } from "../../features/triads/triadTypes";

interface StringGroupSelectorProps {
  selectedStringGroup: VisualStringGroup;
  onChange: (stringGroup: VisualStringGroup) => void;
  onIncrement: (shape: TriadShape) => void;
  onDecrement: (shape: TriadShape) => void;
  progress: PracticeProgressMap;
  shapes: TriadShape[];
  showInversionProgress?: boolean;
  options?: VisualStringGroup[];
}

const shortInversionLabels = {
  root: "Root",
  first: "1st",
  second: "2nd",
};

export function StringGroupSelector({
  onChange,
  onIncrement,
  onDecrement,
  progress,
  selectedStringGroup,
  shapes,
  showInversionProgress = true,
  options = stringSets,
}: StringGroupSelectorProps) {
  const numberedOptions = options.filter((stringGroup) => stringGroup !== "all");
  const showAllOption = options.includes("all");

  function renderOption(stringGroup: VisualStringGroup, className = "") {
    const isSelected = stringGroup === selectedStringGroup;
    return (
      <button
        className={`h-12 rounded-md border text-sm font-black transition ${
          isSelected
            ? "border-zinc-950 bg-zinc-950 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-teal-500"
        } ${className}`}
        key={stringGroup}
        onClick={() => onChange(stringGroup)}
        type="button"
      >
        {stringGroup === "all" ? "All" : stringGroup}
      </button>
    );
  }

  return (
    <section className="h-full min-h-[250px] rounded-md border border-zinc-200 bg-white p-4 shadow-sm" data-tutorial-target="practice-tracking">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
        String group
      </h2>
      <div className="grid grid-cols-4 gap-2" data-tutorial-target="string-group-buttons">
        {numberedOptions.map((stringGroup) => renderOption(stringGroup))}
      </div>
      {showAllOption && <div className="mt-2">{renderOption("all", "w-full")}</div>}
      {showInversionProgress && <div className="mt-3 divide-y divide-zinc-100 border-t border-zinc-200 pt-1">
        {shapes.map((shape) => {
          const count = progress[shape.id]?.practisedCount ?? 0;
          const label = shortInversionLabels[shape.inversion];
          return (
            <div className="flex h-10 items-center gap-2" key={shape.id}>
              <span className="flex-1 text-xs font-semibold text-zinc-500">{label}</span>
              <span className="min-w-7 text-right text-lg font-black tabular-nums text-zinc-900">{count}</span>
              <button
                aria-label={`Undo one practice from ${label} inversion`}
                className="ml-1 flex h-7 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-400 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={count === 0}
                onClick={() => onDecrement(shape)}
                type="button"
              >
                −1
              </button>
              <button
                aria-label={`Add one practice to ${label} inversion`}
                className="flex h-7 w-9 items-center justify-center rounded-md bg-teal-700 text-xs font-black text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                onClick={() => onIncrement(shape)}
                type="button"
              >
                +1
              </button>
            </div>
          );
        })}
      </div>}
    </section>
  );
}
