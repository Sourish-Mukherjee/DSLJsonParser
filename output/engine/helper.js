"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedFieldValue = void 0;
function getNestedFieldValue(obj, field) {
    const fields = field.split(".");
    return fields.reduce((acc, currentField) => {
        if (acc === undefined || acc === null) {
            return undefined;
        }
        if (typeof acc === "string" &&
            (acc.startsWith("{") || acc.startsWith("["))) {
            try {
                acc = JSON.parse(acc);
            }
            catch {
                return undefined;
            }
        }
        if (typeof acc === "object" && acc !== null) {
            return acc[currentField] ?? undefined;
        }
        return undefined;
    }, obj);
}
exports.getNestedFieldValue = getNestedFieldValue;
