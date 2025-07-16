import { inspect } from 'node:util';

const inspectOptions = {
  depth: null,
  colors: true,
  maxArrayLength: null,
  maxStringLength: null,
  breakLength: 80,
  compact: false,
};

export default function displayError(chalk, error) {
  console.log(chalk.red('\n❌ Error fetching offer details:'));
  if (error.response) {
    // API Error
    console.log(chalk.red(`Status: ${error.response.status}`));
    console.log(chalk.red(`Status Text: ${error.response.statusText}`));
    if (error.response.data) {
      console.log(chalk.red('Response Data:'));
      console.log(inspect(error.response.data, inspectOptions));
    }
    // Provide helpful suggestions
    if (error.response.status === 404) {
      console.log(chalk.yellow('\n💡 Suggestions:'));
      console.log(chalk.yellow('   - Check if the offer ID exists'));
      console.log(chalk.yellow('   - Verify the offer ID is correct'));
    } else if (error.response.status === 401 || error.response.status === 403) {
      console.log(chalk.yellow('\n💡 Suggestions:'));
      console.log(chalk.yellow('   - Check your API key is valid'));
      console.log(
        chalk.yellow('   - Verify you have permission to access this offer'),
      );
    }
  } else if (error.request) {
    // Network Error
    console.log(chalk.red('Network Error: Unable to reach the API'));
    console.log(chalk.yellow('\n💡 Suggestions:'));
    console.log(chalk.yellow('   - Check your internet connection'));
    console.log(chalk.yellow('   - Verify the API domain is correct'));
  } else {
    // Other Error
    console.log(chalk.red(`Error: ${error.message}`));
  }
}
