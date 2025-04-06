import { parseDSLQuery } from "../src/parser/parser";
import { executeQuery } from "../src/engine/executeQuery";
import sampleData from "./sampleData.json";

describe("parseDSLQuery and executeQuery", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  const testCases = [
    {
      name: "should parse a valid DSL query with a single condition",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "and",
              conditions: [
                { field: "categories", operator: "any", value: ["electronics"] },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 103, 104, 105] },
    },
    {
      name: "should parse a valid DSL query with multiple conditions",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "or",
              conditions: [
                { field: "categories", operator: "eq", value: "electronics" },
                { field: "value.price", operator: "gt", value: 100 },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 103, 105] },
    },
    {
      name: "should parse a valid DSL query with nested conditions",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "and",
              conditions: [
                {
                  join: "or",
                  conditions: [
                    { field: "categories", operator: "any", value: ["electronics"] },
                    { field: "value.price", operator: "lt", value: 200 },
                  ],
                },
                { field: "value.inStock", operator: "eq", value: true },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 103, 104] },
    },
    {
      name: "should parse a valid DSL query with filter_result mode",
      input: {
        query: [
          {
            select: [{ paths: [], alias: "result", mode: "filter_result" }],
            filter: {
              join: "and",
              conditions: [
                { field: "categories", operator: "any", value: ["electronics"] },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: true },
    },
    {
      name: "should parse a valid DSL query with no filter",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 103, 104, 105] },
    },
    {
      name: "should parse 'gt' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "value.price",
              operator: "gt",
              value: 200,
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 105] },
    },
    {
      name: "should parse 'lt' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "value.price",
              operator: "lt",
              value: 200,
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [103, 104] },
    },
    {
      name: "should parse 'gte' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "value.price",
              operator: "gte",
              value: 200,
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 105] },
    },
    {
      name: "should parse 'lte' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "value.price",
              operator: "lte",
              value: 200,
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [103, 104] },
    },
    {
      name: "should parse 'any' operator with array value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "categories",
              operator: "any",
              value: ["electronics", "mobile"],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 102, 103, 104, 105] },
    },
    {
      name: "should parse 'all' operator with array value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "categories",
              operator: "all",
              value: ["electronics", "mobile"],
            },
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { result: [101, 105] },
    },
    {
      name: "should calculate the sum of numeric values using 'sum' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "total_price",
                aggregation: "sum",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { total_price: 2799.95 },
    },
    {
      name: "should calculate the average of numeric values using 'avg' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "average_price",
                aggregation: "avg",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { average_price: 559.99 },
    },
    {
      name: "should calculate the minimum value using 'min' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "min_price",
                aggregation: "min",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { min_price: 99.99 },
    },
    {
      name: "should calculate the maximum value using 'max' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "max_price",
                aggregation: "max",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { max_price: 1299.99 },
    },
    {
      name: "should count the number of values using 'count' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "count_prices",
                aggregation: "count",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { count_prices: 5 },
    },
    {
      name: "should count distinct values using 'count_distinct' aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.price"],
                alias: "count_distinct_prices",
                aggregation: "count_distinct",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { count_distinct_prices: 5 },
    },
    {
      name: "should handle empty arrays for aggregation",
      input: {
        query: [
          {
            select: [
              {
                paths: ["value.nonExistent"],
                alias: "total_price",
                aggregation: "sum",
              },
            ],
          },
        ],
      },
      shouldThrow: false,
      expectedResult: { total_price: 0 },
    },
  ];

  testCases.forEach(({ name, input, shouldThrow, expectedResult }) => {
    it(name, () => {
      if (shouldThrow) {
        // Validate that the query throws an error
        expect(() => parseDSLQuery(input)).toThrowError();
      } else {
        // Parse the query
        const parsedQuery = parseDSLQuery(input);

        // Execute the query
        const result = executeQuery(sampleData, parsedQuery);

        // Convert the result Map to a plain object for comparison
        const resultObject = Object.fromEntries(result);

        // Validate the result against the expected output
        expect(resultObject).toEqual(expectedResult);
      }
    });
  });
});
