export enum SelectAggregateFunction {
  COUNT = "count",
  COUNT_DISTINCT = "count_distinct",
  SUM = "sum",
  AVG = "avg",
  MIN = "min",
  MAX = "max"
}


export enum SelectMode {
  FIRST = "first",
  LAST = "last",
  UNIQUE = "unique",
  ALL = "all",
  FILTER_RESULT = "filter_result",
}


export type Select = {
  paths: Array<string>;
  alias?: string;
  mode?: SelectMode
  aggregation?: SelectAggregateFunction;

};

export function getSelectSchema(): Record<keyof Select, string> {
  return {
    paths: "Array<string>",
    alias: "string (optional)",
    mode: `${Object.values(SelectMode).join(" | ")} (optional)`,
    aggregation: `${Object.values(SelectAggregateFunction).join(" | ")} (optional)`,
  };
}