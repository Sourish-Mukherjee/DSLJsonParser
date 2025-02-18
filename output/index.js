"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndExectueQuery = void 0;
const parser_1 = require("./parser/parser");
const executeQuery_1 = require("./engine/executeQuery");
function parseAndExectueQuery(dslQueryObject, data) {
    try {
        const parsedQuery = (0, parser_1.parseDSLQuery)(dslQueryObject);
        const result = (0, executeQuery_1.executeQuery)(data, parsedQuery);
        return result;
    }
    catch (error) {
        console.error("Error");
    }
}
exports.parseAndExectueQuery = parseAndExectueQuery;
