

/** @type {import('jest').Config} */
const config = {

  preset: 'jest-expo',

  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],

  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@unimodules|expo-modules-core|@expo|expo|react-native-chart-kit))',
  ],
  
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/fileMock.js',
  },
  
  setupFiles: ['<rootDir>/../jest.setup.js'],
};

module.exports = config;