![Tests](https://github.com/Sourish-Mukherjee/DSLJsonParser/actions/workflows/node.js.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Last Commit](https://img.shields.io/github/last-commit/Sourish-Mukherjee/DSLJsonParser)

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

#### **`paths`** (Required)
- **Description**: An array of field paths (keys in logs) to extract from the dataset.
- **Behavior**:
  - The **first available value** from the `paths` array is taken as the source of truth.
  - If the first path is `undefined`, the next path in the list is considered, and so on. This ensures fallback logic in case a field is missing in some logs but available in others.
  - Supports **nested field access** using dot notation (e.g., `value.details.manufacturer`), where paths like `a.b.c` will traverse inside logs, accessing `b` within `a` and then `c` within `b`.
- **Note**: If the `mode` is set to `filter_result`, this should be an empty array (`[]`).

**Example**:
```json
{
  "select": [
    { "paths": ["id", "value.productId"], "alias": "Identifier", "mode": "first" }
  ]
}
```
**Explanation**:
- If `id` exists, its value will be selected.
- If `id` is `undefined`, the value of `value.productId` will be selected.

---

#### **`alias`** (Optional)
- **Description**: A custom name for the selected field in the output.
- **Behavior**:
  - If `alias` is not provided, the first path in the `paths` array will be used as the key in the output.
  - Useful for renaming fields to make the output more readable or meaningful.

**Example**:
```json
{
  "select": [
    { "paths": ["value.price"], "alias": "ProductPrice", "mode": "all" }
  ]
}
```
**Output**:
```json
{ "ProductPrice": [699.99, 1299.99, 199.99, 99.99, 499.99] }
```

**Explanation**:
- The field `value.price` is selected and renamed to `ProductPrice` in the output.

---

#### **`mode`** (Optional)
- **Description**: Defines how multiple values are handled from the dataset.
- **Details**: For more information, refer to the 📄 [Modes Documentation](docs/selectionModes.md).

---

#### **`aggregation`** (Optional)
- **Description**: Specifies an aggregation function to apply to the selected values.
- **Details**: For more information, refer to the 📄 [Aggregations Documentation](docs/aggregations.md).

---

## Filter Clause (Optional)
The `filter` clause is used to apply conditions to the **entire array of logs** before selection. **A query cannot have only a `filter` clause without a `select` clause.**

### Condition Schema
A `condition` is the basic building block of filtering. Each condition consists of:
- `field`: The field in the log to evaluate.
- `operator`: The comparison operation to apply. **For a list of supported operators, refer to the 📄 [Operators Documentation](docs/operators.md).**
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
| Field   | Required | Description                                                                 |
|---------|----------|-----------------------------------------------------------------------------|
| `select` | ✅ Yes  | Defines the fields to retrieve. A query must have at least one `select`.    |
| ├─ `paths` | ✅ Yes | Defines the field paths to extract.                                         |
| ├─ `alias` | ❌ No  | Custom name for the field (optional).                                       |
| ├─ `mode`  | ❌ No  | Specifies how multiple values should be handled (default: `first`).        |
| └─ `aggregation` | ❌ No | Specifies an aggregation function to summarize the selected values.    |
| `filter` | ❌ No  | Defines conditions to filter logs before applying selection. Can be omitted. |

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

