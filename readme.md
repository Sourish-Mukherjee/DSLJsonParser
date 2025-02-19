# Query Structure Documentation

## Overview
This document describes the structure and functionality of the **DSL Query System**, which is used to filter and select data from a given set of logs. The query system is designed to be flexible, supporting various filtering conditions and selection modes.

## Query Format
A DSL Query consists of an array of query objects, each containing:
- `select`: Specifies the fields to retrieve. **(Required, must be an array)**
- `filter`: Defines the conditions to apply to the entire array of logs before selection. **(Optional)**

### Example Query
```json
{
  "query": [
    {
      "select": [
        { "paths": ["id"], "alias": "Identifier", "mode": "last" },
        { "paths": ["categories"], "alias": "manufacturer" }
      ],
      "filter": {
        "join": "or",
        "conditions": [
          { "field": "value.details.warranty", "operator": "eq", "value": "2 years" },
          {
            "join": "or",
            "conditions": [
              { "field": "value.productId", "operator": "eq", "value": 789 },
              { "field": "value.productId", "operator": "eq", "value": 790 }
            ]
          }
        ]
      }
    }
  ]
}
```

## Select Clause
The `select` clause defines which fields to retrieve from the filtered logs. **A query must contain a `select` clause.**

### Why `select` Must Be an Array
- `select` must be an array because multiple fields may need to be retrieved simultaneously.
- Each selection can have different paths, aliases, and modes, making it necessary to define multiple selections in a structured way.
- Having a single `select` object would limit flexibility and force redundant queries.

### Properties:
- `paths`: Array of field (keys in logs) paths to extract from the logs.
- `alias`: Custom name for the selected field.
- `mode`: Defines how multiple values are handled from the array of logs.

### Path Selection Logic
- The **first available value** from `paths` is taken as the source of truth.
- If the first path is `undefined`, the next path in the list is considered, and so on.
- This ensures fallback logic in case a field is missing in some logs but available in others.
- Nested field access: Paths like `a.b.c` will traverse inside logs, accessing b within a and then c within b.

### Supported Selection Modes
| Mode      | Description |
|-----------|------------|
| `first`   | Returns the first matching value encountered in the logs. |
| `last`    | Returns the last matching value encountered. |
| `all`     | Returns an array of all matching values across the logs. |
| `unique`  | Returns unique values from the result set. |

## Filter Clause (Optional)
The `filter` clause is used to apply conditions to the **entire array of logs** before selection. **A query cannot have only a `filter` clause without a `select` clause.**

### Why `filter` is Optional
- Some queries may simply need to retrieve data without filtering.
- When `filter` is omitted, all logs are considered before applying selection.
- Filtering is useful when only a subset of the logs should be processed.

### How Filtering Works
1. **Log Evaluation:** If a `filter` clause is present, the query first applies conditions to narrow down the logs.
2. **Condition Matching:** Each log is checked against the filter conditions. Logs that do not match are excluded.
3. **Selection Execution:** After filtering, the `select` clause extracts the requested fields from the **remaining logs**.
4. **Final Result:** The selected values are returned according to the defined selection modes.

### Condition Schema
A `condition` is the basic building block of filtering. Each condition consists of:
- `field`: The field in the log to evaluate.
- `operator`: The comparison operation to apply.
- `value`: The value to compare against.

#### Standalone Condition
A single condition applies directly to a log field.
```json
{
  "field": "value.details.warranty",
  "operator": "eq",
  "value": "2 years"
}
```

#### Compound Condition (Using `join`)
Multiple conditions can be grouped using the `join` keyword, which determines how the conditions are evaluated together.
```json
{
  "join": "or",
  "conditions": [
    { "field": "value.productId", "operator": "eq", "value": 789 },
    { "field": "value.productId", "operator": "eq", "value": 790 }
  ]
}
```
- If `join` is `"and"`, **all conditions must be met** for a log to be included.
- If `join` is `"or"`, **at least one condition must be met** for a log to be included.
- Nested `join` conditions allow complex filtering logic.

### Supported Operators
| Operator  | Description |
|-----------|------------|
| `eq`      | Equal to |
| `neq`     | Not equal to |
| `gt`      | Greater than |
| `gte`     | Greater than or equal to |
| `lt`      | Less than |
| `lte`     | Less than or equal to |
| `any`     | At least one value exists in an array |
| `all`     | All values exist in an array |

## Execution Flow
1. **Filter the logs** based on the `filter` clause (if present).
2. **Apply selection logic** to extract required fields based on `select`.
3. **Return results** either as an array or a key-value `Map` (if applicable).

## Example Output
```json
{
  "Identifier": 456,
  "manufacturer": ["electronics", "home appliances"]
}
```

## Required and Optional Fields
| Field   | Required | Description |
|---------|----------|-------------|
| `select` | ✅ Yes | Defines the fields to retrieve. A query must have at least one `select`. |
| `filter` | ❌ No  | Defines conditions to filter logs before applying selection. Can be omitted. |
| `paths` | ✅ Yes (inside `select`) | Defines the field paths to extract. |
| `alias` | ❌ No | Custom name for the field (optional). |
| `mode` | ❌ No | Specifies how multiple values should be handled (default: `first`). |

## Notes
- If a field path is not found, it will return `undefined`.
- Using `join: "or"` allows multiple conditions to be matched.
- Results can be structured as a `Map<string, unknown>` for key-value access.
- **A query must always contain a `select` clause; it cannot have only `filter`.**

## Usage
To execute a query:
```ts
const result = executeQuery(logs, dslQuery);
console.log(result);
```

---