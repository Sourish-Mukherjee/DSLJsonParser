"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasKeys = void 0;
function hasKeys(obj, requiredKeys) {
    return requiredKeys.every((key) => key in obj);
}
exports.hasKeys = hasKeys;
