import { stringGroupColourClasses, stringSets } from "../../data/stringSets";
import type { LifetimeChordSummary } from "../../features/practice/practiceAnalytics";

interface OverallPracticeSummaryProps {
  summaries: LifetimeChordSummary[];
}

export function OverallPracticeSummary({ summaries }: OverallPracticeSummaryProps) {
  const maximumTotal = Math.max(1, ...summaries.map((summary) => summary.total));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950">Overall Practice Summary</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Lifetime practice counts for every chord, combined across all keys.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="String group colours">
          {stringSets.map((stringGroup) => (
            <li className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500" key={stringGroup}>
              <span className={`h-2.5 w-2.5 rounded-full ${stringGroupColourClasses[stringGroup]}`} aria-hidden="true" />
              {stringGroup}
            </li>
          ))}
        </ul>
      </div>

      {summaries.length === 0 ? (
        <p className="mt-4 rounded-md bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          No practice recorded yet. Your lifetime summary will appear here.
        </p>
      ) : (
        <div className="mt-5 max-h-[560px] overflow-y-auto pr-1">
          <div className="grid gap-3">
            {summaries.map((summary) => (
              <div
                aria-label={practiceSummaryLabel(summary)}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem] items-center gap-3"
                key={summary.id}
                role="img"
              >
                <span className="truncate text-right text-sm font-black text-zinc-800" title={summary.symbol}>
                  {summary.symbol}
                </span>
                <div className="flex h-6 overflow-hidden rounded bg-zinc-100">
                  {stringSets.map((stringGroup) => {
                    const count = summary.stringGroups[stringGroup];
                    if (count === 0) return null;
                    return (
                      <span
                        className={`${stringGroupColourClasses[stringGroup]} h-full min-w-px`}
                        key={stringGroup}
                        style={{ width: `${(count / maximumTotal) * 100}%` }}
                        title={`Strings ${stringGroup}: ${count}`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm font-black tabular-nums text-zinc-700">{summary.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function practiceSummaryLabel(summary: LifetimeChordSummary): string {
  const groupCounts = stringSets
    .map((stringGroup) => `strings ${stringGroup}: ${summary.stringGroups[stringGroup]}`)
    .join(", ");
  return `${summary.symbol}, ${summary.total} total practices. ${groupCounts}.`;
}
