# Aggregation Functions

Aggregation functions allow you to summarize data after applying selection modes. These functions are applied **after the mode is processed**.

---

## Supported Aggregations
| Aggregation Function | Description                                   | Return Type |
|-----------------------|-----------------------------------------------|-------------|
| `count`              | Returns the total number of values.           | Number      |
| `count_distinct`      | Returns the total number of unique values.    | Number      |
| `sum`                | Returns the sum of all numeric values.        | Number      |
| `avg`                | Returns the average of all numeric values.    | Number      |
| `min`                | Returns the minimum numeric value.            | Number      |
| `max`                | Returns the maximum numeric value.            | Number      |

---

## Detailed Explanation

### `count` Aggregation
- **Description**: Counts the total number of values.
- **Return Type**: Number.
- **Use Case**: Use when you need the total count of matching values.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "count_prices", "aggregation": "count" }]
  }
  ```
  **Output**:
  ```json
  { "count_prices": 5 }
  ```

### `count_distinct` Aggregation
- **Description**: Counts the total number of unique values.
- **Return Type**: Number.
- **Use Case**: Use when you need the count of distinct values.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "count_distinct_prices", "aggregation": "count_distinct" }]
  }
  ```
  **Output**:
  ```json
  { "count_distinct_prices": 5 }
  ```

### `sum` Aggregation
- **Description**: Calculates the sum of all numeric values.
- **Return Type**: Number.
- **Use Case**: Use when you need the total sum of numeric values.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "total_price", "aggregation": "sum" }]
  }
  ```
  **Output**:
  ```json
  { "total_price": 2799.95 }
  ```

### `avg` Aggregation
- **Description**: Calculates the average of all numeric values.
- **Return Type**: Number.
- **Use Case**: Use when you need the mean value of numeric data.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "average_price", "aggregation": "avg" }]
  }
  ```
  **Output**:
  ```json
  { "average_price": 559.99 }
  ```

### `min` Aggregation
- **Description**: Finds the minimum numeric value.
- **Return Type**: Number.
- **Use Case**: Use when you need the smallest value in the dataset.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "min_price", "aggregation": "min" }]
  }
  ```
  **Output**:
  ```json
  { "min_price": 99.99 }
  ```

### `max` Aggregation
- **Description**: Finds the maximum numeric value.
- **Return Type**: Number.
- **Use Case**: Use when you need the largest value in the dataset.
- **Example**:
  ```json
  {
    "select": [{ "paths": ["value.price"], "alias": "max_price", "aggregation": "max" }]
  }
  ```
  **Output**:
  ```json
  { "max_price": 1299.99 }
  ```

---

## Notes
- **Numeric Fields Only**: Aggregations like `sum`, `avg`, `min`, and `max` only work with numeric fields. Non-numeric values are ignored.
- **Empty Results**: If no values match the filter criteria, the aggregation will return:
  - `count` and `count_distinct`: `0`.
  - `sum`, `avg`, `min`, and `max`: `0` or `undefined` depending on implementation.
- **Performance**: Aggregations like `count_distinct` may have a performance impact on large datasets due to deduplication.