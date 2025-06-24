#!/usr/bin/env node

import { inspect } from 'node:util';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import PassCultureSDK from '../lib/PassCultureSDK.js';

// Configure util.inspect for better object display
const inspectOptions = {
  depth: null,
  colors: true,
  maxArrayLength: null,
  maxStringLength: null,
  breakLength: 80,
  compact: false,
};

// Helper function to mask API key for display
function maskApiKey(key) {
  if (!key || key.length < 8) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    });
  } catch (error) {
    return dateString;
  }
}

// Helper function to display nested object with colors
function displayObject(obj, title = '', indent = 0) {
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

async function main() {
  console.log(chalk.bold.blue('🎭 Pass Culture Offer Details Fetcher'));
  console.log(chalk.blue('=====================================\n'));

  // Check environment variables
  console.log(chalk.yellow('🔍 Checking environment variables...'));

  const apiDomain = process.env.GET_PARAMS_PASS_API_DOMAIN;
  const apiKey = process.env.GET_PARAMS_PASS_API_KEY;

  if (!apiDomain || !apiKey) {
    console.log(chalk.red('❌ Missing required environment variables:'));
    if (!apiDomain) {
      console.log(chalk.red('   - GET_PARAMS_PASS_API_DOMAIN'));
    }
    if (!apiKey) {
      console.log(chalk.red('   - GET_PARAMS_PASS_API_KEY'));
    }
    console.log(
      chalk.yellow('\n💡 Please set these variables in your .env file'),
    );
    process.exit(1);
  }

  console.log(chalk.green('✅ Found API Configuration:'));
  console.log(chalk.cyan(`   Domain: ${apiDomain}`));
  console.log(chalk.cyan(`   API Key: ${maskApiKey(apiKey)}\n`));

  // Ask for confirmation
  const useCredentials = await confirm({
    message: 'Use these credentials?',
    default: true,
  });

  if (!useCredentials) {
    console.log(chalk.yellow('👋 Operation cancelled by user'));
    process.exit(0);
  }

  // Ask for offer ID
  const offerId = await input({
    message: 'Enter Offer ID:',
    validate: (inputValue) => {
      if (!inputValue.trim()) {
        return 'Please enter a valid offer ID';
      }
      if (!/^\d+$/.test(inputValue.trim())) {
        return 'Offer ID should be numeric';
      }
      return true;
    },
  });

  console.log(chalk.blue(`\n🚀 Fetching offer details for ID: ${offerId}...`));

  try {
    // Initialize PassCulture SDK
    const pc = PassCultureSDK({
      key: apiKey,
      api: apiDomain,
      offerLink: `${apiDomain}/offers/:id`, // Default offer link pattern
    });

    // Fetch offer details
    const offerDetails = await pc.offers.events(offerId).get();

    console.log(chalk.green('✅ Successfully fetched offer details!\n'));

    // Display basic information
    console.log(chalk.bold.magenta('📋 OFFER DETAILS'));
    console.log(chalk.magenta('================\n'));

    // Basic Information Section
    console.log(chalk.bold.cyan('📌 Basic Information'));
    console.log(chalk.cyan('───────────────────'));
    console.log(
      `${chalk.green('ID')}: ${chalk.white(offerDetails.id || 'N/A')}`,
    );
    console.log(
      `${chalk.green('Name')}: ${chalk.white(offerDetails.name || 'N/A')}`,
    );
    console.log(
      `${chalk.green('Category')}: ${chalk.white(offerDetails.category || 'N/A')}`,
    );
    console.log(
      `${chalk.green('Status')}: ${chalk.white(offerDetails.status || 'N/A')}`,
    );
    console.log(
      `${chalk.green('Created')}: ${chalk.cyan(formatDate(offerDetails.dateCreated))}`,
    );
    console.log(
      `${chalk.green('Modified')}: ${chalk.cyan(formatDate(offerDetails.dateModifiedAtLastProvider))}\n`,
    );

    // Description Section
    if (offerDetails.description) {
      console.log(chalk.bold.cyan('📝 Description'));
      console.log(chalk.cyan('─────────────'));
      console.log(chalk.white(offerDetails.description));
      console.log();
    }

    // Venue Information
    if (offerDetails.venue) {
      console.log(chalk.bold.cyan('🏢 Venue Information'));
      console.log(chalk.cyan('──────────────────'));
      displayObject(offerDetails.venue);
      console.log();
    }

    // Location Information
    if (offerDetails.location) {
      console.log(chalk.bold.cyan('📍 Location'));
      console.log(chalk.cyan('───────────'));
      displayObject(offerDetails.location);
      console.log();
    }

    // Accessibility Information
    if (offerDetails.accessibility) {
      console.log(chalk.bold.cyan('♿ Accessibility'));
      console.log(chalk.cyan('──────────────'));
      displayObject(offerDetails.accessibility);
      console.log();
    }

    // Price Categories
    if (
      offerDetails.priceCategories
      && offerDetails.priceCategories.length > 0
    ) {
      console.log(chalk.bold.cyan('💰 Price Categories'));
      console.log(chalk.cyan('─────────────────'));
      offerDetails.priceCategories.forEach((category, index) => {
        console.log(
          chalk.yellow(
            `[${index + 1}] ${category.label || 'Unnamed Category'}`,
          ),
        );
        displayObject(category, '', 1);
      });
      console.log();
    }

    // Dates
    if (offerDetails.dates && offerDetails.dates.length > 0) {
      console.log(chalk.bold.cyan('📅 Event Dates'));
      console.log(chalk.cyan('─────────────'));
      offerDetails.dates.forEach((date, index) => {
        console.log(
          chalk.yellow(`[${index + 1}] ${formatDate(date.beginningDatetime)}`),
        );
        displayObject(date, '', 1);
      });
      console.log();
    }

    // Images
    if (offerDetails.image) {
      console.log(chalk.bold.cyan('🖼️  Images'));
      console.log(chalk.cyan('────────'));
      displayObject(offerDetails.image);
      console.log();
    }

    // External ticket office URL
    if (offerDetails.externalTicketOfficeUrl) {
      console.log(chalk.bold.cyan('🎫 External Ticket Office'));
      console.log(chalk.cyan('─────────────────────────'));
      console.log(chalk.blue.underline(offerDetails.externalTicketOfficeUrl));
      console.log();
    }

    const displayDump = await confirm({
      message: 'Display complete object dump?',
      default: false,
    });

    if (!displayDump) {
      return;
    }

    // Complete Object Dump
    console.log(chalk.bold.magenta('🔍 COMPLETE OBJECT DUMP'));
    console.log(chalk.magenta('========================\n'));
    console.log(inspect(offerDetails, inspectOptions));

    console.log(chalk.green('\n✨ Offer details displayed successfully!'));
  } catch (error) {
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
      } else if (
        error.response.status === 401
        || error.response.status === 403
      ) {
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
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.log(chalk.red('\n❌ Unhandled Promise Rejection:'));
  console.log(reason);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Operation cancelled by user'));
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.log(chalk.red('\n❌ Unexpected error:'));
  console.log(error);
  process.exit(1);
});
