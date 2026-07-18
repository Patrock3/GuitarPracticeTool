import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

interface InteractiveTutorialProps {
  onClose: () => void;
}

interface TutorialStep {
  targets: string[];
  title: string;
  description: ReactNode;
}

interface TargetRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

const tutorialSteps: TutorialStep[] = [
  {
    targets: ["main-fretboard"],
    title: "Fretboard View",
    description: (
      <>
        <p>This fretboard is your reference while you practise.</p>
        <p className="mt-2">Learn each triad shape, and pay attention to the notes that make up the chord. Play the notes individually or as a complete chord.</p>
        <p className="mt-2">The next steps will show you how to change the view and explore different triads.</p>
      </>
    ),
  },
  {
    targets: ["key-selection-controls"],
    title: "Choose a key",
    description: (
      <>
        <p><strong className="font-bold text-zinc-800">Select a major key to practise.</strong></p>
        <p className="mt-2">Everything updates automatically when you change the key.</p>
        <p className="mt-2">Use <strong className="font-bold text-zinc-800">Random</strong> to pick a key for you.</p>
      </>
    ),
  },
  {
    targets: ["harmonised-scale"],
    title: "Explore the Harmonised Scale",
    description: "Select any chord in the Harmonised Scale. The fretboard updates to show that chord's triad shapes.",
  },
  {
    targets: ["practice-tracking"],
    title: "Explore string groups",
    description: (
      <>
        <p>The same triads can be practised across four adjacent string groups. Change the string group to practise the same chords in different areas of the fretboard.</p>
        <p className="mt-2">Use the <strong className="font-bold text-zinc-800">+1</strong> buttons to record completed repetitions for each inversion.</p>
        <p className="mt-2">Every repetition is saved to the Progress page so you can review your practice counts later.</p>
      </>
    ),
  },
  {
    targets: ["view-toggle"],
    title: "Switch between Triads and Scale",
    description: "Use Triads to explore chord shapes, or switch to Scale to learn note and interval patterns across the fretboard.",
  },
  {
    targets: [],
    title: "Done!",
    description: (
      <>
        <p>Thanks for completing the tutorial.</p>
        <p className="mt-2">You now know the basics of Guitar Lab:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Choose a key</li>
          <li>Select chords from the Harmonised Scale</li>
          <li>Practise across different string groups</li>
          <li>Switch between the Triads and Scale views</li>
        </ul>
        <p className="mt-3">A good place to start is by choosing one key and working through each chord across all string groups. As you practise, focus on recognising the shapes and the notes that make up each chord.</p>
        <p className="mt-3">Enjoy your practice!</p>
      </>
    ),
  },
];

const spotlightPadding = 6;

export function InteractiveTutorial({ onClose }: InteractiveTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRects, setTargetRects] = useState<TargetRect[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isFinalStep = stepIndex === tutorialSteps.length - 1;
  const step = tutorialSteps[stepIndex];

  useEffect(() => {
    const targets = findTutorialTargets(step.targets);
    if (targets.length === 0) {
      setTargetRects([]);
      return;
    }

    setTargetRects([]);
    targets[0].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    function updateTargetRects() {
      setTargetRects(targets.filter((target) => target.isConnected).map((target) => {
        const rect = target.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      }));
    }

    updateTargetRects();
    const settleTimer = window.setTimeout(updateTargetRects, 350);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateTargetRects);
    const mutationObserver = new MutationObserver(updateTargetRects);
    targets.forEach((target) => resizeObserver?.observe(target));
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateTargetRects);
    window.addEventListener("scroll", updateTargetRects, true);

    return () => {
      window.clearTimeout(settleTimer);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateTargetRects);
      window.removeEventListener("scroll", updateTargetRects, true);
    };
  }, [stepIndex, step.targets]);

  useEffect(() => {
    popoverRef.current?.focus();
  }, [stepIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const targets = findTutorialTargets(step.targets);
      const focusable = [
        ...targets.flatMap(getFocusableElements),
        ...getFocusableElements(popoverRef.current),
      ];
      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
      event.preventDefault();
      focusable[nextIndex].focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, step.targets]);

  const spotlightStyles = targetRects.map((targetRect) => ({
    height: targetRect.height + spotlightPadding * 2,
    left: targetRect.left - spotlightPadding,
    top: targetRect.top - spotlightPadding,
    width: targetRect.width + spotlightPadding * 2,
  }));
  const estimatedPopoverHeight = stepIndex <= 1 || step.targets.includes("practice-tracking") ? 270 : 210;
  const popoverStyle = targetRects[0]
    ? getPopoverPosition(targetRects[0], estimatedPopoverHeight)
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  const backdropSections = targetRects.length > 0
    ? getBackdropSections(targetRects)
    : [{ inset: 0 } satisfies CSSProperties];

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {backdropSections.map((style, index) => (
        <div
          className="pointer-events-auto fixed bg-zinc-950/60"
          key={index}
          onClick={onClose}
          style={style}
        />
      ))}
      {spotlightStyles.map((style, index) => (
        <div
          className="pointer-events-none fixed rounded-lg border-2 border-teal-400 shadow-[0_0_0_4px_rgba(20,184,166,0.2)] transition-[left,top,width,height] duration-200"
          key={step.targets[index]}
          style={style}
        />
      ))}

      <div
        aria-labelledby="tutorial-title"
        className="pointer-events-auto fixed max-h-[calc(100vh-2rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 shadow-2xl outline-none"
        ref={popoverRef}
        role="dialog"
        style={popoverStyle}
        tabIndex={-1}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
          Step {stepIndex + 1} of {tutorialSteps.length}
        </p>
        <h2 className="mt-1 text-lg font-black text-zinc-950" id="tutorial-title">{step.title}</h2>
        <div className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</div>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-zinc-100 pt-3">
          <div className="flex gap-2">
            <button
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (stepIndex === 0) {
                  onClose();
                  return;
                }
                setStepIndex((current) => current - 1);
              }}
              type="button"
            >
              {stepIndex === 0 ? "Skip" : "Previous"}
            </button>
            <button
              className="h-9 rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
              onClick={() => isFinalStep ? onClose() : setStepIndex((current) => current + 1)}
              type="button"
            >
              {isFinalStep ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBackdropSections(targetRects: TargetRect[]): CSSProperties[] {
  const holes = targetRects.flatMap((rect) => {
    const left = Math.max(0, Math.min(window.innerWidth, rect.left));
    const right = Math.max(0, Math.min(window.innerWidth, rect.right));
    const top = Math.max(0, Math.min(window.innerHeight, rect.top));
    const bottom = Math.max(0, Math.min(window.innerHeight, rect.bottom));
    return right > left && bottom > top ? [{ bottom, left, right, top }] : [];
  });
  if (holes.length === 0) return [{ inset: 0 }];

  const xBoundaries = uniqueSorted([0, window.innerWidth, ...holes.flatMap((hole) => [hole.left, hole.right])]);
  const yBoundaries = uniqueSorted([0, window.innerHeight, ...holes.flatMap((hole) => [hole.top, hole.bottom])]);
  const sections: CSSProperties[] = [];

  for (let xIndex = 0; xIndex < xBoundaries.length - 1; xIndex += 1) {
    for (let yIndex = 0; yIndex < yBoundaries.length - 1; yIndex += 1) {
      const left = xBoundaries[xIndex];
      const right = xBoundaries[xIndex + 1];
      const top = yBoundaries[yIndex];
      const bottom = yBoundaries[yIndex + 1];
      const centreX = (left + right) / 2;
      const centreY = (top + bottom) / 2;
      const isInsideSpotlight = holes.some((hole) =>
        centreX >= hole.left && centreX <= hole.right && centreY >= hole.top && centreY <= hole.bottom,
      );

      if (!isInsideSpotlight) {
        sections.push({ height: bottom - top, left, top, width: right - left });
      }
    }
  }

  return sections;
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(
    "button:not([disabled]), select:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
  ));
}

function findTutorialTargets(targetNames: string[]): HTMLElement[] {
  return targetNames.flatMap((targetName) => {
    const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${targetName}"]`);
    return target ? [target] : [];
  });
}

function getPopoverPosition(targetRect: TargetRect, estimatedPopoverHeight: number) {
  const viewportPadding = 16;
  const targetGap = 16;
  const popoverWidth = Math.min(320, window.innerWidth - viewportPadding * 2);
  const hasRoomBelow = window.innerHeight - targetRect.bottom >= estimatedPopoverHeight + targetGap;
  const preferredTop = hasRoomBelow
    ? targetRect.bottom + targetGap
    : targetRect.top - estimatedPopoverHeight - targetGap;

  return {
    left: Math.min(
      Math.max(targetRect.left + targetRect.width / 2 - popoverWidth / 2, viewportPadding),
      window.innerWidth - popoverWidth - viewportPadding,
    ),
    top: Math.max(viewportPadding, preferredTop),
  };
}
