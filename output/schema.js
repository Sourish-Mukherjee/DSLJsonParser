"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DSLQuerySchema = exports.AggregateQuerySchema = exports.FilterQuerySchema = void 0;
const zod_1 = require("zod");
exports.FilterQuerySchema = zod_1.z.object({
    field: zod_1.z.string(),
    operator: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.object({}).passthrough(), zod_1.z.null()]),
});
exports.AggregateQuerySchema = zod_1.z.object({
    function: zod_1.z.string(),
    field: zod_1.z.string(),
});
exports.DSLQuerySchema = zod_1.z.object({
    filter: exports.FilterQuerySchema.optional(),
    aggregate: exports.AggregateQuerySchema.optional(),
});
