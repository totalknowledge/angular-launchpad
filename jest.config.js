module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/**/*.ts',
    "!**/*.module.ts",
  ]
};
