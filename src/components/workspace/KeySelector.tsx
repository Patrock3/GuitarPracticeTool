import { Shuffle } from "lucide-react";
import { musicalKeys } from "../../data/keys";
import type { MusicalKey } from "../../data/keys";
import { Button } from "../ui/Button";

interface KeySelectorProps {
  selectedKey: MusicalKey;
  onChange: (key: MusicalKey) => void;
  onRandom: () => void;
  compact?: boolean;
}

export function KeySelector({ compact = false, selectedKey, onChange, onRandom }: KeySelectorProps) {
  return (
    <div className={compact ? "flex items-end gap-2" : "flex flex-col gap-3 sm:flex-row sm:items-end"}>
      <label className="grid flex-1 gap-2">
        <span className={compact ? "sr-only" : "text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"}>
          Key
        </span>
        <select
          className={`${compact ? "h-10 min-w-32" : "h-11"} rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-950`}
          value={selectedKey.id}
          onChange={(event) => onChange(musicalKeys.find((key) => key.id === event.target.value)!)}
        >
          {musicalKeys.map((key) => (
            <option key={key.id} value={key.id}>
              {key.label}
            </option>
          ))}
        </select>
      </label>
      <Button
        className={compact ? "h-10 min-h-10 px-3" : ""}
        icon={<Shuffle size={17} aria-hidden="true" />}
        onClick={onRandom}
        variant="secondary"
      >
        Random
      </Button>
    </div>
  );
}
