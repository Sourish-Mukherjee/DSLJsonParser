import { parseDSLQuery } from "./parser/parser";
import { executeQuery } from "./engine/executeQuery";

export function parseAndExectueQuery(dslQueryObject: unknown, data: unknown[]) {
  try {
    const parsedQuery = parseDSLQuery(dslQueryObject);
    const result = executeQuery(data, parsedQuery);
    return result;
  } catch (error) {
    console.error("Error");
  }
}