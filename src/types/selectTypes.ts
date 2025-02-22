export enum SelectMode {
  FIRST = "first",
  LAST = "last",
  UNIQUE = "unique",
  ALL = "all",
  FILTER_RESULT = "filter_result",
  COUNT = "count",
  COUNT_UNIQUE = "count_unique",
}


export type Select = {
  paths: Array<string>;
  alias?: string;
  mode?: SelectMode
};

export function getSelectSchema(): Record<keyof Select, string> {
  return {
    paths: "Array<string>",
    alias: "string (optional)",
    mode: `${Object.values(SelectMode).join(" | ")} (optional)`
  };
}