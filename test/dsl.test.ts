import { parseDSLQuery } from "../src/parser/parser";

describe("parseDSLQuery", () => {
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
    // Existing Valid Cases
    {
      name: "should parse a valid DSL query with a single condition",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "and",
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
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
                { field: "category", operator: "eq", value: "electronics" },
                { field: "price", operator: "gt", value: 100 },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
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
                    { field: "category", operator: "eq", value: "electronics" },
                    { field: "price", operator: "lt", value: 200 },
                  ],
                },
                { field: "stock", operator: "gte", value: 10 },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
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
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: false,
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
    },

    // Existing Invalid Cases
    {
      name: "should throw an error if query is missing",
      input: {},
      shouldThrow: true,
      errorMessage: /DSLQuery must have a 'query' property/,
    },
    {
      name: "should throw an error if query is not an array",
      input: { query: {} },
      shouldThrow: true,
      errorMessage: /'query' must be an array/,
    },
    {
      name: "should throw an error if select is missing in a query",
      input: {
        query: [
          {
            filter: {
              join: "and",
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage:
        /Each object in 'query' array must have a 'select' property/,
    },
    {
      name: "should throw an error if paths is not an array",
      input: {
        query: [
          {
            select: [{ paths: "id", alias: "result", mode: "all" }], // Invalid: paths should be an array
            filter: {
              join: "and",
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /'paths' must be of Array<string> type/,
    },
    {
      name: "should throw an error if mode is invalid",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "invalid_mode" }], // Invalid mode
            filter: {
              join: "and",
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage:
        /'mode' must be of first | last | unique | all | filter_result | count | count_unique type/,
    },
    {
      name: "should throw an error if paths is not empty for filter_result mode",
      input: {
        query: [
          {
            select: [
              { paths: ["id"], alias: "result", mode: "filter_result" }, // Invalid: paths should be empty
            ],
            filter: {
              join: "and",
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /'paths' must be empty when mode is 'filter_result'/,
    },
    {
      name: "should throw an error if filter conditions are invalid",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "and",
              conditions: [
                {
                  field: "category",
                  operator: "invalid_operator",
                  value: "electronics",
                }, // Invalid operator
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /Operator must be one of/,
    },
    {
      name: "should throw an error if filter is not an object",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: "invalid_filter", // Invalid: filter should be an object
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /Expected an object but received null or another type/,
    },
    {
      name: "should throw an error if join is invalid in a filter",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "invalid_join", // Invalid join operator
              conditions: [
                { field: "category", operator: "eq", value: "electronics" },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /'join' operator must be one of/,
    },
    {
      name: "should throw an error if conditions is not an array in a filter",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              join: "and",
              conditions: "not_an_array", // Invalid: conditions should be an array
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /'conditions' must be an array/,
    },
    {
      name: "should throw an error if nested conditions are invalid",
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
                    {
                      field: "category",
                      operator: "invalid_operator",
                      value: "electronics",
                    }, // Invalid operator
                  ],
                },
              ],
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /Operator must be one of/,
    },

    // New Test Cases for All Operators
    {
      name: "should parse 'eq' operator with string value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "category",
              operator: "eq",
              value: "electronics",
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should parse 'neq' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "neq",
              value: 100,
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should parse 'gt' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "gt",
              value: 100,
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should parse 'lt' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "lt",
              value: 200,
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should parse 'gte' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "gte",
              value: 150,
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should parse 'lte' operator with number value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "lte",
              value: 150,
            },
          },
        ],
      },
      shouldThrow: false,
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
              value: ["electronics", "home appliances"],
            },
          },
        ],
      },
      shouldThrow: false,
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
              value: ["electronics", "home appliances"],
            },
          },
        ],
      },
      shouldThrow: false,
    },
    {
      name: "should throw an error for 'gt' operator with string value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "price",
              operator: "gt",
              value: "100", // Invalid: gt requires a number
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /Value must be of type: number for operator: gt/,
    },
    {
      name: "should throw an error for 'any' operator with non-array value",
      input: {
        query: [
          {
            select: [{ paths: ["id"], alias: "result", mode: "all" }],
            filter: {
              field: "categories",
              operator: "any",
              value: "electronics", // Invalid: any requires an array
            },
          },
        ],
      },
      shouldThrow: true,
      errorMessage: /Value must be of type: array for operator: any/,
    },
  ];

  testCases.forEach(({ name, input, shouldThrow, errorMessage }) => {
    it(name, () => {
      if (shouldThrow) {
        expect(() => parseDSLQuery(input)).toThrowError(errorMessage);
      } else {
        expect(() => parseDSLQuery(input)).not.toThrow();
      }
    });
  });
});
