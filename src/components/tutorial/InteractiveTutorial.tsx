import { useEffect, useRef, useState } from "react";

interface InteractiveTutorialProps {
  onClose: () => void;
}

interface TutorialStep {
  target: string;
  title: string;
  description: string;
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
    target: "view-toggle",
    title: "Choose a view",
    description: "Use Triads to explore chord shapes, or switch to Scale to see notes across the fretboard.",
  },
  {
    target: "harmonised-scale",
    title: "Choose a chord",
    description: "Select any chord in the Harmonised Scale. The fretboard updates to show that chord's triad shapes.",
  },
  {
    target: "string-groups",
    title: "Explore string groups",
    description: "Change the string group to see the same triads on different sets of adjacent strings.",
  },
];

const spotlightPadding = 6;

export function InteractiveTutorial({ onClose }: InteractiveTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const step = tutorialSteps[stepIndex];

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${step.target}"]`);
    if (!target) return;

    setTargetRect(null);
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    function updateTargetRect() {
      const rect = target!.getBoundingClientRect();
      setTargetRect({
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      });
    }

    updateTargetRect();
    const settleTimer = window.setTimeout(updateTargetRect, 350);
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [step.target]);

  useEffect(() => {
    popoverRef.current?.focus();
  }, [stepIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const spotlightStyle = targetRect ? {
    height: targetRect.height + spotlightPadding * 2,
    left: targetRect.left - spotlightPadding,
    top: targetRect.top - spotlightPadding,
    width: targetRect.width + spotlightPadding * 2,
  } : undefined;
  const popoverStyle = targetRect ? getPopoverPosition(targetRect) : undefined;
  const isFinalStep = stepIndex === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-lg border-2 border-teal-400 shadow-[0_0_0_4px_rgba(20,184,166,0.2),0_0_0_9999px_rgba(9,9,11,0.62)] transition-[left,top,width,height] duration-200"
          style={spotlightStyle}
        />
      )}

      <div
        className="fixed w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-4 shadow-2xl outline-none"
        ref={popoverRef}
        style={popoverStyle}
        tabIndex={-1}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
          Step {stepIndex + 1} of {tutorialSteps.length}
        </p>
        <h2 className="mt-1 text-lg font-black text-zinc-950" id="tutorial-title">{step.title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <button
            className="h-9 rounded-md px-2 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            onClick={onClose}
            type="button"
          >
            Skip
          </button>
          <div className="flex gap-2">
            <button
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => current - 1)}
              type="button"
            >
              Previous
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

function getPopoverPosition(targetRect: TargetRect) {
  const viewportPadding = 16;
  const targetGap = 16;
  const popoverWidth = Math.min(320, window.innerWidth - viewportPadding * 2);
  const estimatedPopoverHeight = 210;
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
