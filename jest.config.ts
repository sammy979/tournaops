import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          strict: false,
          esModuleInterop: true,
          module: "commonjs",
        },
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@prisma)/)",
  ],
  collectCoverageFrom: [
    "lib/scoring-engine.ts",
    "lib/team-import-parser.ts",
    "lib/tournament-generator.ts",
    "lib/stage-advancement-engine.ts",
    "lib/match-result-validation.ts",
  ],
};

export default config;
