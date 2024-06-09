import type {Config} from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.ts"],
  moduleFileExtensions: ["ts", "js"],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  coverageDirectory: "coverage",
};

export default config;
