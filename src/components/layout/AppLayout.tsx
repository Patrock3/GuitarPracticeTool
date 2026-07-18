import type { ReactNode } from "react";
import { Guitar } from "lucide-react";
import type { MusicalKey } from "../../data/keys";
import { KeySelector } from "../workspace/KeySelector";
import type { VisualisationMode } from "../../features/visualisation/visualisationTypes";

interface AppLayoutProps {
  children: ReactNode;
  activePage: "practice" | "progress";
  selectedKey: MusicalKey;
  onKeyChange: (key: MusicalKey) => void;
  onPageChange: (page: "practice" | "progress") => void;
  onRandomKey: () => void;
  visualisationMode: VisualisationMode;
  onVisualisationModeChange: (mode: VisualisationMode) => void;
}

export function AppLayout({
  activePage,
  children,
  onKeyChange,
  onPageChange,
  onRandomKey,
  selectedKey,
  visualisationMode,
  onVisualisationModeChange,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f3ed] text-zinc-900">
      <header className="border-b border-zinc-200 bg-[#fbfaf7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-800 text-white">
              <Guitar size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700/70">
                Triad Coverage
              </p>
              <h1 className="text-xl font-extrabold leading-tight text-zinc-950">Guitar Lab</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-7 xl:gap-10">
            <fieldset className="grid gap-1.5" aria-label="Visualisation mode" data-tutorial-target="view-toggle">
              <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                View
              </legend>
                <div className="grid h-10 grid-cols-2 rounded-md border border-zinc-200 bg-zinc-100 p-1">
                  {(["triads", "scale"] as const).map((mode) => (
                    <button
                      aria-pressed={visualisationMode === mode}
                      className={`h-8 min-w-20 rounded px-3 text-xs font-bold capitalize transition ${visualisationMode === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"}`}
                      key={mode}
                      onClick={() => onVisualisationModeChange(mode)}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
            </fieldset>
            <div className="grid gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Key Selection
              </span>
              <KeySelector
                compact
                selectedKey={selectedKey}
                onChange={onKeyChange}
                onRandom={onRandomKey}
              />
            </div>
            <nav className="grid gap-1.5" aria-label="Session pages">
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Session
              </span>
              <div className="flex gap-2">
                <NavButton active={activePage === "practice"} onClick={() => onPageChange("practice")}>
                  Practice
                </NavButton>
                <NavButton active={activePage === "progress"} onClick={() => onPageChange("progress")}>
                  Progress
                </NavButton>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:py-5">{children}</main>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}

function NavButton({ active, children, onClick }: NavButtonProps) {
  return (
    <button
      className={`h-10 w-24 rounded-md px-4 text-sm font-bold transition ${
        active ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
