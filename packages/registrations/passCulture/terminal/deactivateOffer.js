#!/usr/bin/env node

import { inspect } from 'node:util';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import PassCultureSDK from '../lib/PassCultureSDK.js';
import listBookings from '../listBookings.js';
import { maskApiKey } from './lib/utils.js';
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
  console.log(chalk.bold.blue('🎭 Pass Culture Offer Deactivator'));
  console.log(chalk.blue('==================================\n'));

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

  // Get offer ID from command line argument or prompt
  let offerId = process.argv[2];

  if (offerId) {
    // Validate command line offer ID
    if (!/^\d+$/.test(offerId.trim())) {
      console.log(
        chalk.red('❌ Invalid offer ID provided as argument. Must be numeric.'),
      );
      process.exit(1);
    }
    console.log(chalk.cyan(`📋 Using offer ID from argument: ${offerId}`));
  } else {
    // Ask for offer ID
    offerId = await input({
      message: 'Enter Offer ID to deactivate:',
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
  }

  console.log(chalk.blue(`\n🚀 Processing offer with ID: ${offerId}...`));

  try {
    // Initialize PassCulture SDK
    const pc = PassCultureSDK({
      key: apiKey,
      api: apiDomain,
    });

    // First get the current offer details to check its status
    const offerDetails = await pc.offers.events(offerId).get();

    // Check if offer is already deactivated
    if (offerDetails.status !== 'ACTIVE') {
      console.log(chalk.yellow('\n⚠️ Offer is already deactivated:'));
      console.log(chalk.cyan(`Offer ID: ${offerId}`));
      process.exit(0);
    }

    // Check for existing bookings
    console.log(chalk.blue('\n🔍 Checking for existing bookings...'));
    const bookings = await listBookings(pc, offerId, { detailed: true });

    if (bookings && bookings.length > 0) {
      console.log(
        chalk.yellow(
          `\n⚠️ Found ${bookings.length} existing booking(s) for this offer`,
        ),
      );

      const deleteStocks = await confirm({
        message: 'Would you like to delete the associated dates (stocks)?',
        default: false,
      });

      if (deleteStocks) {
        console.log(chalk.blue('\n🗑️ Deleting associated stocks...'));

        // Delete each stock associated with the offer
        for (const booking of bookings) {
          if (booking.stockId) {
            try {
              await pc.offers.events(offerId).dates(booking.stockId).delete();
              console.log(
                chalk.green(`✅ Deleted stock ID: ${booking.stockId}`),
              );
            } catch (error) {
              console.log(
                chalk.red(`❌ Failed to delete stock ID: ${booking.stockId}`),
              );
              console.log(chalk.red(error.message));
            }
          }
        }
      } else {
        console.log(chalk.yellow('\nℹ️ Skipping stock deletion as requested'));
      }
    } else {
      console.log(
        chalk.green('\n✅ No existing bookings found for this offer'),
      );
    }

    // Proceed with deactivation
    console.log(chalk.blue(`\n🔄 Deactivating offer with ID: ${offerId}...`));
    const result = await pc.offers.events(offerId).patch({ isActive: false });

    console.log(chalk.green('\n✅ Offer deactivated successfully!'));
    console.log(chalk.cyan(`Offer ID: ${offerId}`));
    console.log(chalk.cyan(`Response: ${inspect(result, inspectOptions)}`));
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
