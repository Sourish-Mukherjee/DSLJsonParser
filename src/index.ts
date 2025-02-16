import { parseDSLQuery } from "./parser/parser";

const filterQuery = {
  field: "status",
  operator: "eq",
  value: "active",
  anyKey: "anyValue",
};

try {
  console.log("Filter Query:", parseDSLQuery(filterQuery));
} catch (error) {
  console.error("Error");
}
