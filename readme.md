# Query Structure Documentation

## Overview
This document describes the structure and functionality of the **DSL Query System**, which is used to filter and select data from a given set of logs. The query system is designed to be flexible, supporting various filtering conditions, selection modes, and aggregation functions.

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
        { "paths": ["categories"], "alias": "manufacturer", "aggregation": "count_distinct" }
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

### Properties:
- `paths`: Array of field (keys in logs) paths to extract from the logs.

  **Note:** If mode passed is `filter_result`, this should be set to an empty array.
  
  **For mode details, refer to the** [Mode Section](#supported-selection-modes).
- `alias`: Custom name for the selected field.
- `mode`: Defines how multiple values are handled from the array of logs. **Note:** This is performed after retrieving all values from the array of logs. This operation is not performed on a single log.
- `aggregation`: Specifies an aggregation function to apply to the selected values. **Note:** Aggregation is applied after the `mode` is processed.

### Path Selection Logic
- The **first available value** from `paths` is taken as the source of truth.
- If the first path is `undefined`, the next path in the list is considered, and so on.
- This ensures fallback logic in case a field is missing in some logs but available in others.
- Nested field access: Paths like `a.b.c` will traverse inside logs, accessing `b` within `a` and then `c` within `b`.

---

## Supported Selection Modes
| Mode           | Description |
|----------------|-------------|
| `first`        | Returns the first matching value encountered in the logs. |
| `last`         | Returns the last matching value encountered. |
| `all`          | Returns an array of all matching values across the logs. |
| `unique`       | Returns unique values from the result set. |
| `filter_result`| Returns `true` or `false`, indicating whether the filter conditions were met for a given log. Use this when you only need to check if any log matches the specified filter criteria, without selecting specific fields from the logs. |

---

## Supported Aggregation Functions
| Aggregation Function | Description |
|-----------------------|-------------|
| `count`              | Returns the total number of values. |
| `count_distinct`      | Returns the total number of unique values. |
| `sum`                | Returns the sum of all numeric values. |
| `avg`                | Returns the average of all numeric values. |
| `min`                | Returns the minimum numeric value. |
| `max`                | Returns the maximum numeric value. |

### Notes on Aggregation:
- Aggregation is applied **after** the `mode` is processed.
- If `mode` is `unique`, duplicates are removed before aggregation.
- Aggregation functions like `sum`, `avg`, `min`, and `max` only work with numeric values. Non-numeric values are ignored.

---

## Filter Clause (Optional)
The `filter` clause is used to apply conditions to the **entire array of logs** before selection. **A query cannot have only a `filter` clause without a `select` clause.**

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

---

### Supported Operators
| Operator  | Description |
|-----------|-------------|
| `eq`      | Equal to |
| `neq`     | Not equal to |
| `gt`      | Greater than |
| `gte`     | Greater than or equal to |
| `lt`      | Less than |
| `lte`     | Less than or equal to |
| `any`     | At least one value exists in an array |
| `all`     | All values exist in an array |

---

## Execution Flow
1. **Filter the logs** based on the `filter` clause (if present).
2. **Apply selection logic** to extract required fields based on `select`.
3. **Process modes** to handle multiple values (e.g., `first`, `last`, `unique`).
4. **Apply aggregation** to summarize the processed values (if specified).
5. **Return results** either as an array or a key-value `Map` (if applicable).

---

## Example Output
```json
{
  "Identifier": 456,
  "manufacturer": 2
}
```

---

## Required and Optional Fields
| Field   | Required | Description |
|---------|----------|-------------|
| `select` | ✅ Yes | Defines the fields to retrieve. A query must have at least one `select`. |
| `filter` | ❌ No  | Defines conditions to filter logs before applying selection. Can be omitted. |
| `paths` | ✅ Yes (inside `select`) | Defines the field paths to extract. |
| `alias` | ❌ No | Custom name for the field (optional). |
| `mode` | ❌ No | Specifies how multiple values should be handled (default: `first`). |
| `aggregation` | ❌ No | Specifies an aggregation function to summarize the selected values. |

---

## Notes
- If a field path is not found, it will return `undefined`.
- Using `join: "or"` allows multiple conditions to be matched.
- Results can be structured as a `Map<string, unknown>` for key-value access.
- **A query must always contain a `select` clause; it cannot have only `filter`.**

---

## Usage
To execute a query:
```ts
const result = parseAndExectueQuery(dslQuery, logs);
console.log(result);
```

