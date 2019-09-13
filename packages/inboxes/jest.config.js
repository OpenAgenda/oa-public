module.exports = {
  coveragePathIgnorePatterns: [ '/migrations/' ],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.js'
  ],
  testURL: 'http://localhost/'
};
