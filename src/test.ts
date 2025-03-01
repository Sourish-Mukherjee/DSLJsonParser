import { getNestedFieldValue } from "./engine/helper";

export const sampleArrayObjectJson: Array<object> = [
  {
    id: 300,
    title: "Product Condition",
    isEnabled: false,
    createdDate: "2025-01-10T08:30:00Z",
    categories: ["electronics", "home appliances"],
    rating: 4.5,
    discount: null,
    value: {
      productId: 1234,
      price: 299.99,
      inStock: false,
      details: {
        manufacturer: "Suzuki",
        warranty: "3 years",
        returnPolicy: "30 days",
      },
      extra:
        '{"feature": "HDR", "quality": "4K", "specs": {"resolution": "3840x2160"}}',
    },
  },
  {
    id: 456,
    title: "Product Condition",
    isEnabled: false,
    createdDate: "2025-01-10T08:30:00Z",
    categories: ["electronics", "home appliances"],
    rating: 4.5,
    discount: null,
    value: {
      productId: 789,
      price: 299.99,
      inStock: true,
      details: {
        manufacturer: "TechCorp",
        warranty: "2 years",
        returnPolicy: "30 days",
      },
    },
  },
  {
    id: 650,
    // title: "Smart Home Hub",
    title: null,
    isEnabled: true,
    createdDate: "2025-02-15T10:00:00Z",
    categories: "abcd",
    rating: 4.8,
    discount: 15,
    value: {
      productId: 790,
      price: 199.99,
      inStock: true,
      details: {
        manufacturer: "HomeTech",
        warranty: "1 year",
        returnPolicy: "60 days",
      },
    },
  },
];

export const filterQuery = {
  query: [
    {
      select: [
        {
          paths: ["title", "value.details.manufacturer"],
          alias: "column",
          mode: "first",
        },
        {
          paths: ["id"],
          alias: "Identifier",
          mode: "all",
        },
      ],
    },
  ],
};

export const complextQuery = {
  query: [
    {
      select: [
        {
          paths: ["id"],
          alias: "Identifier",
          mode: "all",
        },
        {
          paths: ["categories"],
          alias: "manufacturer",
        },
      ],
      filter: {
        join: "or",
        conditions: [
          {
            field: "value.details.warranty",
            operator: "eq",
            value: "2 years",
          },
          {
            join: "or", // Nested join here is correct
            conditions: [
              {
                field: "value.productId",
                operator: "eq",
                value: 789,
              },
              {
                field: "value.productId",
                operator: "eq",
                value: 790,
              },
            ],
          },
        ],
      },
    },
    {
      select: [
        {
          paths: ["title", "value.details.manufacturer"],
          alias: "column",
          mode: "first",
        },
      ],
    },
  ],
};
