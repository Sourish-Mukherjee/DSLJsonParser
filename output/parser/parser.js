"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDSLQuery = void 0;
const operatorTypes_1 = require("../types/operatorTypes");
const selectTypes_1 = require("../types/selectTypes");
const valueTypes_1 = require("../types/valueTypes");
const helper_1 = require("./helper");
/**
 * Validates a Condition object.
 * @param obj The object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateFilter(obj, path = "root") {
    const errors = [];
    if (typeof obj.field !== "string") {
        errors.push({ field: `${path}.field`, message: "Field must be a string" });
    }
    const operator = obj.operator;
    if (!Object.values(operatorTypes_1.LogicalOperator).includes(operator)) {
        errors.push({
            field: `${path}.operator`,
            message: `Operator must be one of: ${Object.values(operatorTypes_1.LogicalOperator).join(", ")}`,
        });
    }
    else {
        const allowedTypes = valueTypes_1.mapperLogicalOperatorToValueTypes[operator];
        if (!(0, valueTypes_1.isValidValueType)(obj.value, allowedTypes)) {
            errors.push({
                field: `${path}.value`,
                message: `Value must be of type: ${allowedTypes.join(", ")} for operator: ${operator}`,
            });
        }
    }
    return errors;
}
/**
 * Validates a JoinCondition object.
 * @param obj The object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateJoinFilter(obj, path = "root") {
    const errors = [];
    if (!Object.values(operatorTypes_1.JoinOperator).includes(obj.join)) {
        errors.push({
            field: `${path}.join`,
            message: `'join' operator must be one of: ${Object.values(operatorTypes_1.JoinOperator).join(", ")}`,
        });
    }
    if (!Array.isArray(obj.conditions)) {
        errors.push({
            field: `${path}.conditions`,
            message: "'conditions' must be an array",
        });
    }
    else {
        obj.conditions.forEach((condition, index) => {
            errors.push(...validateObjectAsFilter(condition, `${path}.conditions[${index}]`));
        });
    }
    return errors;
}
/**
 * Validates the `select` field.
 * @param obj The object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateSelect(obj, path) {
    const errors = [];
    if (!Array.isArray(obj.select)) {
        errors.push({
            field: `${path}.select`,
            message: `Select must be an array of ${JSON.stringify((0, selectTypes_1.getSelectSchema)())}`,
        });
    }
    else {
        obj.select.forEach((item, index) => {
            if (!Array.isArray(item.paths) ||
                !item.paths.every((p) => typeof p === "string")) {
                errors.push({
                    field: `${path}.select[${index}].paths`,
                    message: `'paths' must be of ${(0, selectTypes_1.getSelectSchema)().paths} type`,
                });
            }
            if (item.alias !== undefined && typeof item.alias !== "string") {
                errors.push({
                    field: `${path}.select[${index}].alias`,
                    message: `'alias' must be of ${(0, selectTypes_1.getSelectSchema)().alias} type`,
                });
            }
            if (item.mode !== undefined) {
                const validModes = Object.values(selectTypes_1.SelectMode);
                if (!validModes.includes(item.mode)) {
                    errors.push({
                        field: `${path}.select[${index}].mode`,
                        message: `'mode' must be of ${(0, selectTypes_1.getSelectSchema)().mode} type`,
                    });
                }
            }
        });
    }
    return errors;
}
/**
 * Validates an object as a Condition or JoinCondition.
 * @param obj The object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateObjectAsFilter(obj, path = "root") {
    if (typeof obj !== "object" || obj === null) {
        return [
            {
                field: path,
                message: "Expected an object but received null or another type",
            },
        ];
    }
    const recordObj = obj;
    if ((0, helper_1.hasKeys)(recordObj, ["field", "operator", "value"])) {
        return validateFilter(recordObj, path);
    }
    else if ((0, helper_1.hasKeys)(recordObj, ["join", "conditions"])) {
        return validateJoinFilter(recordObj, path);
    }
    return [
        {
            field: path,
            message: "Invalid structure: Must be a Condition object or JoinCondition object",
        },
    ];
}
/**
 * Validates a select object with optional filter.
 * @param obj The select object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateSelectWithFilter(obj, path) {
    const errors = [];
    errors.push(...validateSelect(obj, path));
    if (obj.filter) {
        errors.push(...validateObjectAsFilter(obj.filter, `${path}.filter`));
    }
    return errors;
}
/**
 * Parses and validates a DSL query.
 * Throws an error if validation fails.
 * @param query The query object to validate.
 * @returns The validated query object.
 */
function parseDSLQuery(dslQueryObject) {
    const errors = [];
    if (typeof dslQueryObject !== "object" || dslQueryObject === null) {
        errors.push({
            field: "root",
            message: "DSLQuery must be an object",
        });
        console.error("Validation errors:", errors);
        throw new Error(`Invalid DSLQuery: ${JSON.stringify(errors, null, 2)}`);
    }
    const dslQuery = dslQueryObject;
    if (!("query" in dslQuery)) {
        errors.push({
            field: "root",
            message: "DSLQuery must have a 'query' property",
        });
    }
    if (!Array.isArray(dslQuery.query)) {
        errors.push({
            field: "root.query",
            message: "'query' must be an array",
        });
    }
    else {
        dslQuery.query.forEach((selectObj, index) => {
            if (typeof selectObj !== "object" || selectObj === null) {
                errors.push({
                    field: `root.query[${index}]`,
                    message: "Each 'query' object must be an object",
                });
                return;
            }
            if (!("select" in selectObj)) {
                errors.push({
                    field: `root.query[${index}]`,
                    message: "Each object in 'query' array must have a 'select' property",
                });
                return;
            }
            errors.push(...validateSelectWithFilter(selectObj, `root.query[${index}]`));
        });
    }
    if (errors.length > 0) {
        console.error("Validation errors:", errors);
        throw new Error(`Invalid DSLQuery: ${JSON.stringify(errors, null, 2)}`);
    }
    return dslQuery;
}
exports.parseDSLQuery = parseDSLQuery;
