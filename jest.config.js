module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testPathIgnorePatterns: ["/node_modules/", "/src/test.ts"],
};
