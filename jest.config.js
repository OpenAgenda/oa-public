'use strict';

module.exports = {
  rootDir: __dirname,
  projects: [
    '<rootDir>/packages/agenda-docx',
    '<rootDir>/packages/agenda-portal',
    '<rootDir>/packages/logs',
    '<rootDir>/packages/mails',
    '<rootDir>/packages/members',
    // '<rootDir>/packages/sdk-js',
    '<rootDir>/packages/users'
  ],
  collectCoverage: true,
};
