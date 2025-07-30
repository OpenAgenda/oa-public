import { displayObject } from './display.js';
import { formatDate } from './utils.js';

export default function displayMainInfo(chalk, offerDetails) {
  console.log(chalk.green('✅ Successfully fetched offer details!\n'));

  // Display basic information
  console.log(chalk.bold.magenta('📋 OFFER DETAILS'));
  console.log(chalk.magenta('================\n'));

  // Basic Information Section
  console.log(chalk.bold.cyan('📌 Basic Information'));
  console.log(chalk.cyan('───────────────────'));
  console.log(`${chalk.green('ID')}: ${chalk.white(offerDetails.id || 'N/A')}`);
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
  if (offerDetails.priceCategories && offerDetails.priceCategories.length > 0) {
    console.log(chalk.bold.cyan('💰 Price Categories'));
    console.log(chalk.cyan('─────────────────'));
    offerDetails.priceCategories.forEach((category, index) => {
      console.log(
        chalk.yellow(`[${index + 1}] ${category.label || 'Unnamed Category'}`),
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
}
