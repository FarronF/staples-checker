const baseConfig = require('../../jest.config.base.ts');

module.exports = {
  ...baseConfig,
  displayName: 'core-api',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // Package-specific exclusions
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/index.ts', // Exclude main entry point
  ],
};
