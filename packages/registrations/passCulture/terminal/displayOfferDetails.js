#!/usr/bin/env node

import { inspect } from 'node:util';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import PassCultureSDK from '../lib/PassCultureSDK.js';
import { maskApiKey } from './lib/utils.js';
import displayMainInfo from './lib/displayMainInfo.js';
import displayError from './lib/displayError.js';

// Configure util.inspect for better object display
const inspectOptions = {
  depth: null,
  colors: true,
  maxArrayLength: null,
  maxStringLength: null,
  breakLength: 80,
  compact: false,
};

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

    displayMainInfo(chalk, offerDetails);

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
    displayError(chalk, error);
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
