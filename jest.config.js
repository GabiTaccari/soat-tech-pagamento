module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.spec.ts"],

  collectCoverage: false,

  globals: {
    "ts-jest": {
      isolatedModules: true,
      diagnostics: false,
    },
  },
};
