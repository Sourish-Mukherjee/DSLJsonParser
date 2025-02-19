"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinOperator = exports.LogicalOperator = void 0;
var LogicalOperator;
(function (LogicalOperator) {
    LogicalOperator["EQ"] = "eq";
    LogicalOperator["NEQ"] = "neq";
    LogicalOperator["GT"] = "gt";
    LogicalOperator["LT"] = "lt";
    LogicalOperator["GTE"] = "gte";
    LogicalOperator["LTE"] = "lte";
    LogicalOperator["ANY"] = "any";
    LogicalOperator["ALL"] = "all";
})(LogicalOperator = exports.LogicalOperator || (exports.LogicalOperator = {}));
var JoinOperator;
(function (JoinOperator) {
    JoinOperator["AND"] = "and";
    JoinOperator["OR"] = "or";
})(JoinOperator = exports.JoinOperator || (exports.JoinOperator = {}));
