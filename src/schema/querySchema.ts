import { z } from "zod";
import { FilterOperator } from "../types/operatorTypes";

export const FilterQuerySchema = z.object({
  field: z.string(),
  operator: z.nativeEnum(FilterOperator), // Ensures only values from FilterOperator are allowed
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({}).passthrough(),
    z.null(),
  ]),
});
