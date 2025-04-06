# Supported Operators

The DSL Query System supports the following operators for filtering data. Operators are applied to individual fields in the dataset.

---

## Supported Operators
| Operator  | Description                              | Supported Value Types |
|-----------|------------------------------------------|------------------------|
| `eq`      | Equal to                                 | String, Number, Boolean |
| `neq`     | Not equal to                             | String, Number, Boolean |
| `gt`      | Greater than                             | Number                 |
| `gte`     | Greater than or equal to                | Number                 |
| `lt`      | Less than                                | Number                 |
| `lte`     | Less than or equal to                   | Number                 |
| `any`     | At least one value exists in an array   | Array                  |
| `all`     | All values exist in an array            | Array                  |

---

## Detailed Explanation

### `eq` Operator
- **Description**: Checks if the field value is equal to the specified value.
- **Supported Types**: String, Number, Boolean.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "eq", "value": 699.99 }
  }
  ```
  **Output**:
  ```json
  { "result": [101] }
  ```

### `neq` Operator
- **Description**: Checks if the field value is not equal to the specified value.
- **Supported Types**: String, Number, Boolean.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "neq", "value": 699.99 }
  }
  ```
  **Output**:
  ```json
  { "result": [102, 103, 104, 105] }
  ```

### `gt` Operator
- **Description**: Checks if the field value is greater than the specified value.
- **Supported Types**: Number.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "gt", "value": 200 }
  }
  ```
  **Output**:
  ```json
  { "result": [101, 102] }
  ```

### `gte` Operator
- **Description**: Checks if the field value is greater than or equal to the specified value.
- **Supported Types**: Number.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "gte", "value": 200 }
  }
  ```
  **Output**:
  ```json
  { "result": [101, 102, 105] }
  ```

### `lt` Operator
- **Description**: Checks if the field value is less than the specified value.
- **Supported Types**: Number.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "lt", "value": 200 }
  }
  ```
  **Output**:
  ```json
  { "result": [103, 104] }
  ```

### `lte` Operator
- **Description**: Checks if the field value is less than or equal to the specified value.
- **Supported Types**: Number.
- **Example**:
  ```json
  {
    "filter": { "field": "value.price", "operator": "lte", "value": 200 }
  }
  ```
  **Output**:
  ```json
  { "result": [103, 104] }
  ```

### `any` Operator
- **Description**: Checks if at least one value in the field matches any value in the specified array.
- **Supported Types**: Array.
- **Example**:
  ```json
  {
    "filter": { "field": "categories", "operator": "any", "value": ["electronics", "mobile"] }
  }
  ```
  **Output**:
  ```json
  { "result": [101, 102, 103, 104, 105] }
  ```

### `all` Operator
- **Description**: Checks if all values in the specified array exist in the field.
- **Supported Types**: Array.
- **Example**:
  ```json
  {
    "filter": { "field": "categories", "operator": "all", "value": ["electronics", "mobile"] }
  }
  ```
  **Output**:
  ```json
  { "result": [101, 105] }
  ```

---

## Notes
- **Type Matching**: Ensure the value type matches the operator. For example:
  - `gt` and `lt` require numeric values.
  - `any` and `all` require arrays.
- **Empty Results**: If no values match the filter criteria, the result will be an empty array (`[]`).
- **Compound Conditions**: Use the `join` keyword with `and` or `or` to combine multiple conditions.