# Selection Modes

Selection modes define how multiple values are handled when retrieving data from the dataset. These modes are applied **after filtering** and determine how the selected values are processed.

---

## Supported Modes
| Mode           | Description                                                                 | Return Type         |
|----------------|-----------------------------------------------------------------------------|---------------------|
| `first`        | Returns the **first matching value** encountered in the dataset.            | Single value (any)  |
| `last`         | Returns the **last matching value** encountered in the dataset.             | Single value (any)  |
| `all`          | Returns an **array of all matching values** across the dataset.             | Array of values     |
| `unique`       | Returns an **array of unique values** from the result set.                  | Array of values     |
| `filter_result`| Returns `true` or `false`, indicating whether the filter conditions were met.| Boolean (`true/false`) |

---

## Detailed Explanation

### `first` Mode
- **Description**: Retrieves the first value that matches the filter criteria.
- **Return Type**: Single value (any type).
- **Use Case**: Use when you only need the first occurrence of a value.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "first_price", "mode": "first" }]
  }
  ```
  **Output**:
  ```json
  { "first_price": 699.99 }
  ```

### `last` Mode
- **Description**: Retrieves the last value that matches the filter criteria.
- **Return Type**: Single value (any type).
- **Use Case**: Use when you only need the last occurrence of a value.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "last_price", "mode": "last" }]
  }
  ```
  **Output**:
  ```json
  { "last_price": 499.99 }
  ```

### `all` Mode
- **Description**: Retrieves all values that match the filter criteria.
- **Return Type**: Array of values.
- **Use Case**: Use when you need all matching values.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "all_prices", "mode": "all" }]
  }
  ```
  **Output**:
  ```json
  { "all_prices": [699.99, 1299.99, 199.99, 99.99, 499.99] }
  ```

### `unique` Mode
- **Description**: Retrieves unique values from the result set.
- **Return Type**: Array of values.
- **Use Case**: Use when you need distinct values without duplicates.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "unique_prices", "mode": "unique" }]
  }
  ```
  **Output**:
  ```json
  { "unique_prices": [699.99, 1299.99, 199.99, 99.99, 499.99] }
  ```

### `filter_result` Mode
- **Description**: Returns `true` or `false` based on whether the filter conditions were met.
- **Return Type**: Boolean (`true/false`).
- **Use Case**: Use when you only need to check if the filter conditions are satisfied, without selecting specific fields.
- **Example**:
  ```json
  {
    "select": [{ "paths": [], "alias": "result", "mode": "filter_result" }],
    "filter": { "field": "categories", "operator": "any", "value": ["electronics"] }
  }
  ```
  **Output**:
  ```json
  { "result": true }
  ```

---

## Notes
- **Order Matters**: The `first` and `last` modes depend on the order of the dataset. Ensure the dataset is sorted if order is important.
- **Empty Results**: If no values match the filter criteria:
  - `first` and `last` return `undefined`.
  - `all` and `unique` return an empty array (`[]`).
  - `filter_result` returns `false`.
- **Performance**: Modes like `unique` may have a performance impact on large datasets due to deduplication.