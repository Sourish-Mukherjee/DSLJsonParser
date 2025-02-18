import {
  LogicalOperator,
  JoinOperator,
} from "./operatorTypes";
import { Select } from "./selectTypes";
import { AllowedValueTypes } from "./valueTypes";

export type Condition = {
  field: string;
  operator: LogicalOperator;
  value: AllowedValueTypes;
};

export type JoinCondition = {
  join: JoinOperator;
  conditions: Condition[];
};

export type DSLQuery = {
  query: { select: Select[]; filter?: Condition | JoinCondition }[];
};
