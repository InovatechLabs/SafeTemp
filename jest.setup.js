/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'], // mocks globais, ex: axios
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',  // transforma TS
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|react-native-chart-kit)'
  ],
  testEnvironment: 'jsdom',
};
