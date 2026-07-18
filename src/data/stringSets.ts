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

export const stringGroupColourClasses: Record<StringGroup, string> = {
  "123": "bg-teal-700",
  "234": "bg-amber-500",
  "345": "bg-rose-600",
  "456": "bg-indigo-600",
};

export const allStringSets: VisualStringGroup[] = [...stringSets, "all"];
