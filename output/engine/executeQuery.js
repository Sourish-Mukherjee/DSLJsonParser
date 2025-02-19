"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = void 0;
const selectTypes_1 = require("../types/selectTypes");
const operatorTypes_1 = require("../types/operatorTypes");
const helper_1 = require("./helper");
/**
 * Evaluates a condition based on the filter's logical operator.
 */
function evaluateFilterCondition(item, filter) {
    const { field, operator, value } = filter;
    const fieldValue = (0, helper_1.getNestedFieldValue)(item, field);
    switch (operator) {
        case operatorTypes_1.LogicalOperator.EQ:
            return fieldValue === value;
        case operatorTypes_1.LogicalOperator.NEQ:
            return fieldValue !== value;
        case operatorTypes_1.LogicalOperator.GT:
            return (typeof fieldValue === "number" &&
                typeof value === "number" &&
                fieldValue > value);
        case operatorTypes_1.LogicalOperator.LT:
            return (typeof fieldValue === "number" &&
                typeof value === "number" &&
                fieldValue < value);
        case operatorTypes_1.LogicalOperator.GTE:
            return (typeof fieldValue === "number" &&
                typeof value === "number" &&
                fieldValue >= value);
        case operatorTypes_1.LogicalOperator.LTE:
            return (typeof fieldValue === "number" &&
                typeof value === "number" &&
                fieldValue <= value);
        case operatorTypes_1.LogicalOperator.ALL:
            return (Array.isArray(fieldValue) &&
                Array.isArray(value) &&
                value.every((v) => fieldValue.includes(v)));
        case operatorTypes_1.LogicalOperator.ANY:
            return (Array.isArray(fieldValue) &&
                Array.isArray(value) &&
                fieldValue.some((v) => value.includes(v)));
    }
}
/**
 * Evaluates a filter or join filter against an item
 */
function evaluateFilter(item, filter) {
    if (!filter)
        return true;
    if ("field" in filter) {
        return evaluateFilterCondition(item, filter);
    }
    const { join, conditions } = filter;
    return join === operatorTypes_1.JoinOperator.OR
        ? conditions.some((rule) => evaluateFilter(item, rule))
        : conditions.every((rule) => evaluateFilter(item, rule));
}
/**
 * Applies selection logic to an item
 */
function applySelect(items, select) {
    return [
        select.reduce((result, { paths, alias, mode }) => {
            const values = items.flatMap((item) => paths
                .map((path) => (0, helper_1.getNestedFieldValue)(item, path))
                .filter((val) => val !== undefined));
            const finalValue = (() => {
                switch (mode) {
                    case selectTypes_1.SelectMode.FIRST:
                        return values[0];
                    case selectTypes_1.SelectMode.LAST:
                        return values.at(-1);
                    case selectTypes_1.SelectMode.ALL:
                        return values;
                    case selectTypes_1.SelectMode.UNIQUE:
                        return [...new Set(values)];
                    default:
                        return values[0]; // Fallback to FIRST
                }
            })();
            return { ...result, [alias ?? paths[0]]: finalValue };
        }, {}),
    ];
}
/**
 * Executes the query on the provided data
 */
function executeQuery(data, dslQuery) {
    if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
    }
    // Convert data to Record<string, unknown>[] and filter out non-objects
    const validData = data.filter((item) => typeof item === "object" && item !== null);
    const queryResult = new Map();
    // Process each select in the query
    dslQuery.query.forEach(({ select, filter }) => {
        // Filter the data based on the query conditions
        const filteredData = validData.filter((item) => evaluateFilter(item, filter));
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
exports.executeQuery = executeQuery;
