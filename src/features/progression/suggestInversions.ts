import type { StringGroup } from "../../data/stringSets";
import { triadInversions } from "../../data/triads";
import type { ProgressionItem } from "./progressionTypes";
import { buildTriadShapes } from "../triads/triadTargets";
import type { TriadShape } from "../triads/triadTypes";

interface Candidate {
  item: ProgressionItem;
  shape: TriadShape;
}

interface Path {
  candidates: Candidate[];
  score: number;
}

export function suggestProgressionInversions(
  items: ProgressionItem[],
  stringGroup: StringGroup,
): ProgressionItem[] {
  if (items.length === 0) return items;

  const candidatesByStep = items.map((item) =>
    triadInversions.flatMap((inversion) => {
      const shape = buildTriadShapes(item.chord, stringGroup).find((candidate) => candidate.inversion === inversion);
      return shape ? [{ item: { ...item, inversion }, shape }] : [];
    }),
  );

  if (candidatesByStep.some((candidates) => candidates.length === 0)) return items;

  let paths: Path[] = candidatesByStep[0].map((candidate) => ({
    candidates: [candidate],
    score: startingPositionScore(candidate.shape),
  }));

  for (let step = 1; step < candidatesByStep.length; step += 1) {
    paths = candidatesByStep[step].map((candidate) => {
      const options = paths.map((path) => ({
        candidates: [...path.candidates, candidate],
        score: path.score + movementScore(path.candidates[path.candidates.length - 1].shape, candidate.shape),
      }));
      return options.reduce((best, option) => option.score < best.score ? option : best);
    });
  }

  const bestPath = paths.reduce((best, path) => path.score < best.score ? path : best);
  return bestPath.candidates.map((candidate) => candidate.item);
}

export function movementScore(from: TriadShape, to: TriadShape): number {
  const fromFrets = orderedFrets(from);
  const toFrets = orderedFrets(to);
  const noteMovement = fromFrets.reduce((total, fret, index) => total + Math.abs(fret - toFrets[index]), 0);
  const positionJump = Math.abs(average(fromFrets) - average(toFrets));
  const largeJumpPenalty = Math.max(0, positionJump - 4) * 3;
  return noteMovement + positionJump * 0.5 + largeJumpPenalty;
}

function startingPositionScore(shape: TriadShape): number {
  // A light tie-breaker keeps equally smooth paths in a practical lower-neck position.
  return average(orderedFrets(shape)) * 0.05;
}

function orderedFrets(shape: TriadShape): number[] {
  return [...shape.markers].sort((left, right) => left.string - right.string).map((marker) => marker.fret);
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
