import type { FretMarker } from "../../features/triads/triadTypes";

interface FretboardDiagramProps {
  strings: number[];
  markers: FretMarker[];
  size?: "compact" | "large";
}

export function FretboardDiagram({ markers, size = "compact", strings }: FretboardDiagramProps) {
  const markerFrets = markers.map((marker) => marker.fret);
  const minFret = Math.max(0, Math.min(...markerFrets) - 1);
  const maxFret = Math.max(...markerFrets) + 1;
  const frets = Array.from({ length: maxFret - minFret + 1 }, (_, index) => minFret + index);
  const rowHeight = size === "large" ? 76 : 42;
  const fretWidth = size === "large" ? "minmax(82px, 1fr)" : "minmax(48px, 1fr)";
  const labelWidth = size === "large" ? "70px" : "52px";

  return (
    <div className={`overflow-x-auto rounded-md bg-[#efe8dc] ${size === "large" ? "p-5" : "p-3"}`}>
      <div
        className={size === "large" ? "grid min-w-[620px]" : "grid min-w-[320px]"}
        style={{
          gridTemplateColumns: `${labelWidth} repeat(${frets.length}, ${fretWidth})`,
          gridTemplateRows: `repeat(${strings.length + 1}, ${rowHeight}px)`,
        }}
      >
        <div />
        {frets.map((fret) => (
          <div
            className="flex items-center justify-center border-l border-zinc-400 text-sm font-bold text-zinc-500 first:border-l-4"
            key={fret}
          >
            {fret}
          </div>
        ))}

        {strings.map((string) => (
          <StringRow frets={frets} key={string} markers={markers} size={size} string={string} />
        ))}
      </div>
    </div>
  );
}

interface StringRowProps {
  string: number;
  frets: number[];
  markers: FretMarker[];
  size: "compact" | "large";
}

function StringRow({ frets, markers, size, string }: StringRowProps) {
  return (
    <>
      <div className="flex items-center justify-center border-t border-zinc-400 text-sm font-bold text-zinc-600">
        {string}
      </div>
      {frets.map((fret) => {
        const marker = markers.find((item) => item.string === string && item.fret === fret);
        return (
          <div
            className="relative flex items-center justify-center border-l border-t border-zinc-400"
            key={`${string}-${fret}`}
          >
            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-zinc-500" />
            {marker && (
              <div
                className={`relative z-10 flex items-center justify-center rounded-full bg-teal-800 font-black text-white shadow-sm ring-2 ring-white ${
                  size === "large" ? "h-14 w-14 text-sm" : "h-9 w-9 text-xs"
                }`}
              >
                <span>{marker.interval}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
