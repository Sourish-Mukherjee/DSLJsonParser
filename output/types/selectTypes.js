"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectSchema = exports.SelectMode = exports.SelectAggregateFunction = void 0;
var SelectAggregateFunction;
(function (SelectAggregateFunction) {
    SelectAggregateFunction["COUNT"] = "count";
    SelectAggregateFunction["COUNT_DISTINCT"] = "count_distinct";
    SelectAggregateFunction["SUM"] = "sum";
    SelectAggregateFunction["AVG"] = "avg";
    SelectAggregateFunction["MIN"] = "min";
    SelectAggregateFunction["MAX"] = "max";
})(SelectAggregateFunction = exports.SelectAggregateFunction || (exports.SelectAggregateFunction = {}));
var SelectMode;
(function (SelectMode) {
    SelectMode["FIRST"] = "first";
    SelectMode["LAST"] = "last";
    SelectMode["UNIQUE"] = "unique";
    SelectMode["ALL"] = "all";
    SelectMode["FILTER_RESULT"] = "filter_result";
})(SelectMode = exports.SelectMode || (exports.SelectMode = {}));
function getSelectSchema() {
    return {
        paths: "Array<string>",
        alias: "string (optional)",
        mode: `${Object.values(SelectMode).join(" | ")} (optional)`,
        aggregation: `${Object.values(SelectAggregateFunction).join(" | ")} (optional)`,
        calculationOnly: "boolean (optional)",
    };
}
exports.getSelectSchema = getSelectSchema;
