"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterQuerySchema = void 0;
const operatorTypes_1 = require("../types/operatorTypes");
exports.FilterQuerySchema = z.object({
    field: z.string(),
    operator: z.nativeEnum(operatorTypes_1.FilterOperator),
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.object({}).passthrough(),
        z.null(),
    ]),
});
