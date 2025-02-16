import { FilterQuery } from "../types/queryTypes";

export function executeQuery(data: Array<unknown>, query: FilterQuery): unknown[] {
  let result = data;

  if (query) {
    const { field, operator, value } = query;
    result = result.filter((item: unknown) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }
      const fieldValue = (item as Record<string, unknown>)[field];
      switch (operator) {
        case "eq":
          return fieldValue === value;
        case "neq":
          return fieldValue !== value;
        case "gt":
          return (
            typeof fieldValue === "number" &&
            typeof value === "number" &&
            fieldValue > value
          );
        case "lt":
          return (
            typeof fieldValue === "number" &&
            typeof value === "number" &&
            fieldValue < value
          );
        case "gte":
          return (
            typeof fieldValue === "number" &&
            typeof value === "number" &&
            fieldValue >= value
          );
        case "lte":
          return (
            typeof fieldValue === "number" &&
            typeof value === "number" &&
            fieldValue <= value
          );
        default:
          return false;
      }
    });
  }
  return result;
}
