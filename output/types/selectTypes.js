"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectSchema = exports.SelectMode = void 0;
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
        mode: `${Object.values(SelectMode).join(" | ")} (optional)`
    };
}
exports.getSelectSchema = getSelectSchema;
