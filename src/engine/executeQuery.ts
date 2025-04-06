import { DSLQuery, Condition, JoinCondition } from "../types/queryTypes";
import { Select, SelectAggregateFunction, SelectMode } from "../types/selectTypes";
import { LogicalOperator, JoinOperator } from "../types/operatorTypes";
import { getNestedFieldValue } from "./helper";

/**
 * Evaluates a condition based on the filter's logical operator.
 */
function evaluateFilterCondition(
  item: Record<string, unknown>,
  filter: Condition
): boolean {
  const { field, operator, value } = filter;
  const fieldValue = getNestedFieldValue(item, field);

  switch (operator) {
    case LogicalOperator.EQ:
      return fieldValue === value;
    case LogicalOperator.NEQ:
      return fieldValue !== value;
    case LogicalOperator.GT:
      return (
        typeof fieldValue === "number" &&
        typeof value === "number" &&
        fieldValue > value
      );
    case LogicalOperator.LT:
      return (
        typeof fieldValue === "number" &&
        typeof value === "number" &&
        fieldValue < value
      );
    case LogicalOperator.GTE:
      return (
        typeof fieldValue === "number" &&
        typeof value === "number" &&
        fieldValue >= value
      );
    case LogicalOperator.LTE:
      return (
        typeof fieldValue === "number" &&
        typeof value === "number" &&
        fieldValue <= value
      );
    case LogicalOperator.ALL:
      return (
        Array.isArray(fieldValue) &&
        Array.isArray(value) &&
        value.every((v) => fieldValue.includes(v))
      );
    case LogicalOperator.ANY:
      return (
        Array.isArray(fieldValue) &&
        Array.isArray(value) &&
        fieldValue.some((v) => value.includes(v))
      );
    default:
      return false;
  }
}

/**
 * Evaluates a filter or join filter against an item
 */
function evaluateFilter(
  item: Record<string, unknown>,
  filter?: Condition | JoinCondition
): boolean {
  if (!filter) return true; // No filter means include all items
  if ("field" in filter) {
    return evaluateFilterCondition(item, filter);
  }
  const { join, conditions } = filter;
  return join === JoinOperator.OR
    ? conditions.some((rule) => evaluateFilter(item, rule))
    : conditions.every((rule) => evaluateFilter(item, rule));
}

/**
 * Applies selection logic to an item
 */
function applySelect(
  items: Record<string, unknown>[],
  select: Select[]
): Record<string, unknown>[] {
  return [
    select.reduce((result, { paths, alias, mode, aggregation }) => {
      const values = items.flatMap((item) =>
        paths
          .map((path) => getNestedFieldValue(item, path))
          .filter((val) => val !== undefined)
      );

      const processedValues = (() => {
        switch (mode) {
          case SelectMode.UNIQUE:
            return [...new Set(values)];
          case SelectMode.ALL:
            return values;
          case SelectMode.FIRST:
            return values.length > 0 ? values[0] : undefined;
          case SelectMode.LAST:
            return values.length > 0 ? values.at(-1) : undefined;
          case SelectMode.FILTER_RESULT:
            return items.length > 0;
          default:
            return values;
        }
      })();

      const finalValue = (() => {
        if (Array.isArray(processedValues)) {
          switch (aggregation) {
            case SelectAggregateFunction.COUNT:
              return processedValues.length;
            case SelectAggregateFunction.COUNT_DISTINCT:
              return [...new Set(processedValues)].length;
            case SelectAggregateFunction.SUM:
              return processedValues.reduce((acc: number, val) => {
                return acc + (typeof val === "number" ? val : 0);
              }, 0);
            case SelectAggregateFunction.AVG:
              return (
                processedValues.reduce((acc: number, val) => {
                  return acc + (typeof val === "number" ? val : 0);
                }, 0) / processedValues.length
              );
            case SelectAggregateFunction.MIN:
              return Math.min(
                ...processedValues.map((val) =>
                  typeof val === "number" ? val : Infinity
                )
              );
            case SelectAggregateFunction.MAX:
              return Math.max(
                ...processedValues.map((val) =>
                  typeof val === "number" ? val : -Infinity
                )
              );
            default:
              return processedValues;
          }
        }
        return processedValues;
      })();

      return { ...result, [alias ?? paths[0]]: finalValue };
    }, {} as Record<string, unknown>),
  ];
}

/**
 * Executes the query on the provided data
 */
export function executeQuery(
  data: Array<unknown>,
  dslQuery: DSLQuery
): Map<string, unknown> {
  if (!Array.isArray(data)) {
    throw new Error("Data must be an array");
  }

  const validData = data.filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null
  );

  const queryResult = new Map<string, unknown>();

  dslQuery.query.forEach(({ select, filter }) => {
    const filteredData = validData.filter((item) =>
      evaluateFilter(item, filter)
    );

    const selectedData = applySelect(filteredData, select);
    selectedData.forEach((result) => {
      Object.entries(result).forEach(([key, value]) => {
        queryResult.set(key, value);
      });
    });
  });

  return queryResult;
}
