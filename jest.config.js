module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.spec.ts"],

  collectCoverage: true,

  coverageReporters: [
    "json-summary",
    "lcov",
    "text"
  ],

  globals: {
    "ts-jest": {
      isolatedModules: true,
      diagnostics: false,
    },
  },
};
