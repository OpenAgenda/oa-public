import { inspect } from 'node:util';
import chalk from 'chalk';
import { formatDate } from './utils.js';

// Configure util.inspect for better object display
const inspectOptions = {
  depth: null,
  colors: true,
  maxArrayLength: null,
  maxStringLength: null,
  breakLength: 80,
  compact: false,
};

// Helper function to display nested object with colors
export function displayObject(obj, title = '', indent = 0) {
  const indentStr = '  '.repeat(indent);

  if (title) {
    console.log(chalk.cyan.bold(`${indentStr}${title}:`));
  }

  if (obj === null || obj === undefined) {
    console.log(chalk.gray(`${indentStr}  N/A`));
    return;
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    console.log(`${indentStr}  ${inspect(obj, inspectOptions)}`);
    return;
  }

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      console.log(chalk.gray(`${indentStr}  ${key}: N/A`));
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      console.log(chalk.yellow(`${indentStr}  ${key}:`));
      displayObject(value, '', indent + 2);
    } else if (Array.isArray(value)) {
      console.log(
        chalk.yellow(`${indentStr}  ${key}: [${value.length} items]`),
      );
      value.forEach((item, index) => {
        console.log(chalk.magenta(`${indentStr}    [${index}]:`));
        displayObject(item, '', indent + 3);
      });
    } else if (
      key.toLowerCase().includes('date')
      || key.toLowerCase().includes('time')
    ) {
      console.log(
        `${indentStr}  ${chalk.green(key)}: ${chalk.cyan(formatDate(value))}`,
      );
    } else if (typeof value === 'string' && value.startsWith('http')) {
      console.log(
        `${indentStr}  ${chalk.green(key)}: ${chalk.blue.underline(value)}`,
      );
    } else {
      console.log(`${indentStr}  ${chalk.green(key)}: ${chalk.white(value)}`);
    }
  });
}
