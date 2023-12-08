'use strict';

const inquirer = require('inquirer');

module.exports = {
  term(message) {
    return inquirer
      .prompt([
        {
          type: 'input',
          name: 'response',
          message,
        },
      ])
      .then(answers => answers.response);
  },
  confirm(message) {
    return inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'confirmation',
          message,
        },
      ])
      .then(answers => answers.confirmation);
  },
};
