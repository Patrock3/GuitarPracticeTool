export type StringSet =
  | "123"
  | "234"
  | "345"
  | "456";

export type StringGroup = StringSet;
export type VisualStringGroup = StringSet | "all";

export const stringSets: StringSet[] = [
  "123",
  "234",
  "345",
  "456",
];

export const allStringSets: VisualStringGroup[] = [...stringSets, "all"];
