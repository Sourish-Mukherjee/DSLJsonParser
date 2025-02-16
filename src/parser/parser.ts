import { FilterQuery } from "../types/queryTypes";
import { FilterQuerySchema } from "../schema/querySchema";

export function parseDSLQuery(query: unknown): FilterQuery {
  console.log("Received query:", query);

  const result = FilterQuerySchema.safeParse(query);

  if (!result.success) {
    console.error("Failed to parse query:", result.error.errors);
    throw new Error("Invalid query");
  }

  const parsedQuery = result.data;

  const dslQuery: FilterQuery = {
    field: parsedQuery.field,
    operator: parsedQuery.operator,
    value: parsedQuery.value as string | number | boolean | object | null,
  };
  console.log("Parsed filter:", dslQuery);

  console.log("Final DSL query:", dslQuery);
  return dslQuery;
}
