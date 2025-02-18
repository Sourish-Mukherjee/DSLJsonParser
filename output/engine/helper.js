"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedFieldValue = void 0;
function getNestedFieldValue(obj, field) {
    const fields = field.split(".");
    return fields.reduce((acc, currentField) => {
        if (acc === undefined || acc === null || typeof acc !== "object") {
            return undefined; // If path is invalid, return undefined
        }
        return acc[currentField];
    }, obj);
}
exports.getNestedFieldValue = getNestedFieldValue;
