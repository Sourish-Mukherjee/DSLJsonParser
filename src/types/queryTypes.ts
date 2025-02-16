import { FilterOperator } from "./operatorTypes";

export interface FilterQuery {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | object | null;
}