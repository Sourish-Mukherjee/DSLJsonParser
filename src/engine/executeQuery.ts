import { DSLQuery, Condition, JoinCondition } from "../types/queryTypes";
import { Select, SelectMode } from "../types/selectTypes";
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
  }
}

/**
 * Evaluates a filter or join filter against an item
 */
function evaluateFilter(
  item: Record<string, unknown>,
  filter?: Condition | JoinCondition
): boolean {
  if (!filter) return true;
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
    select.reduce((result, { paths, alias, mode }) => {
      const values = items.flatMap((item) =>
        paths
          .map((path) => getNestedFieldValue(item, path))
          .filter((val) => val !== undefined)
      );

      const finalValue = (() => {
        switch (mode) {
          case SelectMode.FIRST:
            return values[0];
          case SelectMode.LAST:
            return values.at(-1);
          case SelectMode.ALL:
            return values;
          case SelectMode.UNIQUE:
            return [...new Set(values)];
          case SelectMode.FILTER_RESULT:
            return items.length > 0;
          default:
            return values[0]; // Fallback to FIRST
        }
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

  // Convert data to Record<string, unknown>[] and filter out non-objects
  const validData = data.filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null
  );

  const queryResult = new Map<string, unknown>();

  // Process each select in the query
  dslQuery.query.forEach(({ select, filter }) => {
    // Filter the data based on the query conditions
    const filteredData = validData.filter((item) =>
      evaluateFilter(item, filter)
    );

    // Apply the select logic to transform the data
    const selectedData = applySelect(filteredData, select);

    // Store in Map using alias as key and selected data as value
    selectedData.forEach((result) => {
      Object.entries(result).forEach(([key, value]) => {
        queryResult.set(key, value);
      });
    });
  });

  return queryResult;
}
