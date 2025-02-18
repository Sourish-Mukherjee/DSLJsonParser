# Query Structure Documentation

## Overview
This document describes the structure and functionality of the **DSL Query System**, which is used to filter and select data from a given dataset. The query system is designed to be flexible, supporting various filtering conditions and selection modes.

## Query Format
A DSL Query consists of an array of query objects, each containing:
- `select`: Specifies the fields to retrieve. **(Required)**
- `filter`: Defines the conditions to apply to the dataset before selection. **(Optional)**

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
The `select` clause defines which fields to retrieve from the filtered dataset. **A query must contain a `select` clause.**

### Properties:
- `paths`: Array of field paths to extract from the data.
- `alias`: Custom name for the selected field.
- `mode`: Defines how multiple values are handled.

### Path Selection Logic
- The **first available value** from `paths` is taken as the source of truth.
- If the first path is `undefined`, the next path in the list is considered, and so on.
- This ensures fallback logic in case a field is missing in some logs but available in others.

### Supported Selection Modes
| Mode      | Description |
|-----------|------------|
| `first`   | Returns the first matching value encountered in the dataset. |
| `last`    | Returns the last matching value encountered. |
| `all`     | Returns an array of all matching values across the dataset. |
| `unique`  | Returns unique values from the result set. |

## Filter Clause (Optional)
The `filter` clause is used to apply conditions to the dataset before selection. **A query cannot have only a `filter` clause without a `select` clause.**

### Simple Condition
```json
{
  "field": "value.details.warranty",
  "operator": "eq",
  "value": "2 years"
}
```

### Compound Condition (Using `join`)
```json
{
  "join": "or",
  "conditions": [
    { "field": "value.productId", "operator": "eq", "value": 789 },
    { "field": "value.productId", "operator": "eq", "value": 790 }
  ]
}
```

### Supported Operators
| Operator  | Description |
|-----------|------------|
| `eq`      | Equal to |
| `neq`     | Not equal to |
| `gt`      | Greater than |
| `gte`     | Greater than or equal to |
| `lt`      | Less than |
| `lte`     | Less than or equal to |
| `all`     | Value exists in an array (previously `in`) |
| `not_all` | Value does not exist in an array (previously `nin`) |

## Execution Flow
1. **Filter the dataset** based on the `filter` clause (if present).
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
| `filter` | ❌ No  | Defines conditions to filter data before applying selection. Can be omitted. |
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
const result = executeQuery(data, dslQuery);
console.log(result);
```

---

This document provides a high-level overview of the query structure. For more details, refer to the implementation of `executeQuery` and `applySelect`. 🚀

