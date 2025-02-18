"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidValueType = exports.mapperLogicalOperatorToValueTypes = void 0;
const operatorTypes_1 = require("./operatorTypes");
exports.mapperLogicalOperatorToValueTypes = {
    [operatorTypes_1.LogicalOperator.EQ]: ["string", "boolean", "number"],
    [operatorTypes_1.LogicalOperator.NEQ]: ["string", "boolean", "number"],
    [operatorTypes_1.LogicalOperator.GT]: ["number"],
    [operatorTypes_1.LogicalOperator.LT]: ["number"],
    [operatorTypes_1.LogicalOperator.GTE]: ["number"],
    [operatorTypes_1.LogicalOperator.LTE]: ["number"],
    [operatorTypes_1.LogicalOperator.ALL]: ["array"],
};
function isValidValueType(value, allowedTypes) {
    if (allowedTypes.includes("array") && Array.isArray(value)) {
        return true;
    }
    return allowedTypes.some((type) => typeof value === type);
}
exports.isValidValueType = isValidValueType;
