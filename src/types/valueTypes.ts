import { LogicalOperator } from "./operatorTypes";

type Primitive = string | number | boolean | null;
export type AllowedValueTypes = Primitive | Primitive[];

export const mapperLogicalOperatorToValueTypes: Record<
  LogicalOperator,
  AllowedValueTypes[]
> = {
  [LogicalOperator.EQ]: ["string", "boolean", "number"],
  [LogicalOperator.NEQ]: ["string", "boolean", "number"],
  [LogicalOperator.GT]: ["number"],
  [LogicalOperator.LT]: ["number"],
  [LogicalOperator.GTE]: ["number"],
  [LogicalOperator.LTE]: ["number"],
  [LogicalOperator.ANY]: ["array"],
  [LogicalOperator.ALL]: ["array"],
};

export function isValidValueType(
  value: unknown,
  allowedTypes: AllowedValueTypes[]
): boolean {
  if (allowedTypes.includes("array") && Array.isArray(value)) {
    return true;
  }
  return allowedTypes.some((type) => typeof value === type);
}
