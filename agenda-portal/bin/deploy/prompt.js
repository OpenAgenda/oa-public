import inquirer from 'inquirer';

export function term(message) {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'response',
        message,
      },
    ])
    .then((answers) => answers.response);
}

export function confirm(message) {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message,
      },
    ])
    .then((answers) => answers.confirmation);
}
