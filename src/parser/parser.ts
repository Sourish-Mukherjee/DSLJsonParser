import { ValidationError } from "../types/errorTypes";
import { LogicalOperator, JoinOperator } from "../types/operatorTypes";
import { DSLQuery } from "../types/queryTypes";
import {
  getSelectSchema,
  SelectAggregateFunction,
  SelectMode,
} from "../types/selectTypes";
import {
  mapperLogicalOperatorToValueTypes,
  isValidValueType,
} from "../types/valueTypes";
import { hasKeys } from "./helper";

/**
 * Validates a Condition object.
 * @param obj The object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateFilter(
  obj: Record<string, unknown>,
  path: string = "root"
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof obj.field !== "string") {
    errors.push({ field: `${path}.field`, message: "Field must be a string" });
  }

  const operator = obj.operator as LogicalOperator;
  if (!Object.values(LogicalOperator).includes(operator)) {
    errors.push({
      field: `${path}.operator`,
      message: `Operator must be one of: ${Object.values(LogicalOperator).join(
        ", "
      )}`,
    });
  } else {
    const allowedTypes = mapperLogicalOperatorToValueTypes[operator];
    if (!isValidValueType(obj.value, allowedTypes)) {
      errors.push({
        field: `${path}.value`,
        message: `Value must be of type: ${allowedTypes.join(
          ", "
        )} for operator: ${operator}`,
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
function validateJoinFilter(
  obj: Record<string, unknown>,
  path: string = "root"
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Object.values(JoinOperator).includes(obj.join as JoinOperator)) {
    errors.push({
      field: `${path}.join`,
      message: `'join' operator must be one of: ${Object.values(
        JoinOperator
      ).join(", ")}`,
    });
  }

  if (!Array.isArray(obj.conditions)) {
    errors.push({
      field: `${path}.conditions`,
      message: "'conditions' must be an array",
    });
  } else {
    obj.conditions.forEach((condition, index) => {
      errors.push(
        ...validateObjectAsFilter(condition, `${path}.conditions[${index}]`)
      );
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
function validateSelect(
  obj: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(obj.select)) {
    errors.push({
      field: `${path}.select`,
      message: `Select must be an array of ${JSON.stringify(
        getSelectSchema()
      )}`,
    });
  } else {
    obj.select.forEach((item, index) => {
      if (
        !Array.isArray(item.paths) ||
        !item.paths.every((p: unknown) => typeof p === "string")
      ) {
        errors.push({
          field: `${path}.select[${index}].paths`,
          message: `'paths' must be of ${getSelectSchema().paths} type`,
        });
      }

      if (item.alias !== undefined && typeof item.alias !== "string") {
        errors.push({
          field: `${path}.select[${index}].alias`,
          message: `'alias' must be of ${getSelectSchema().alias} type`,
        });
      }

      if (item.mode !== undefined) {
        const validModes = Object.values(SelectMode);
        if (!validModes.includes(item.mode as SelectMode)) {
          errors.push({
            field: `${path}.select[${index}].mode`,
            message: `'mode' must be of ${getSelectSchema().mode} type`,
          });
        }

        if (
          item.mode === SelectMode.FILTER_RESULT &&
          Array.isArray(item.paths) &&
          item.paths.length > 0
        ) {
          errors.push({
            field: `${path}.select[${index}].paths`,
            message: `'paths' must be empty when mode is 'filter_result'`,
          });
        }
      }

      if (item.aggregation !== undefined) {
        const validAggregations = Object.values(SelectAggregateFunction);
        if (
          !validAggregations.includes(
            item.aggregation as SelectAggregateFunction
          )
        ) {
          errors.push({
            field: `${path}.select[${index}].aggregation`,
            message: `'aggregation' must be of ${
              getSelectSchema().aggregation
            } type`,
          });
        }
      }

      /*
       * The calculationOnly property is optional and can be a boolean.
       * If it is true, paths must not be empty and alias must be defined.
       * If it is false or undefined, no additional validation is needed.
       */
      if (item.calculationOnly !== undefined) {
        if (typeof item.calculationOnly !== "boolean") {
          errors.push({
            field: `${path}.select[${index}].calculationOnly`,
            message: `'calculationOnly' must be of ${
              getSelectSchema().calculationOnly
            } type`,
          });
        } else {
          if (item.calculationOnly) {
            if (item.paths.length === 0) {
              errors.push({
                field: `${path}.select[${index}].paths`,
                message: `'paths' must not be empty when calculationOnly is true`,
              });
            }
            if (!item.alias) {
              errors.push({
                field: `${path}.select[${index}].alias`,
                message: `'alias' must be defined when calculationOnly is true`,
              });
            }
          }
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
function validateObjectAsFilter(
  obj: unknown,
  path: string = "root"
): ValidationError[] {
  if (typeof obj !== "object" || obj === null) {
    return [
      {
        field: path,
        message: "Expected an object but received null or another type",
      },
    ];
  }

  const recordObj = obj as Record<string, unknown>;

  if (hasKeys(recordObj, ["field", "operator", "value"])) {
    return validateFilter(recordObj, path);
  } else if (hasKeys(recordObj, ["join", "conditions"])) {
    return validateJoinFilter(recordObj, path);
  }

  return [
    {
      field: path,
      message:
        "Invalid structure: Must be a Condition object or JoinCondition object",
    },
  ];
}

/**
 * Validates a select object with optional filter.
 * @param obj The select object to validate.
 * @param path The current path for error reporting.
 * @returns An array of validation errors.
 */
function validateSelectWithFilter(
  obj: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

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
export function parseDSLQuery(dslQueryObject: unknown): DSLQuery {
  const errors: ValidationError[] = [];

  if (typeof dslQueryObject !== "object" || dslQueryObject === null) {
    errors.push({
      field: "root",
      message: "DSLQuery must be an object",
    });
    console.error("Validation errors:", errors);
    throw new Error(`Invalid DSLQuery: ${JSON.stringify(errors, null, 2)}`);
  }

  const dslQuery = dslQueryObject as Record<string, unknown>;

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
  } else {
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

      errors.push(
        ...validateSelectWithFilter(
          selectObj as Record<string, unknown>,
          `root.query[${index}]`
        )
      );
    });
  }

  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    throw new Error(`Invalid DSLQuery: ${JSON.stringify(errors, null, 2)}`);
  }
  return dslQuery as DSLQuery;
}
