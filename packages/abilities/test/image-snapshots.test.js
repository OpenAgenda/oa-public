/**
 * @jest-environment jsdom
 */

/* This test needs the static build of the storybook to run.
* `yarn image-snapshots` generates the static build & uses the image snapshots behavior of storyshots.
* */
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from '@storybook/addon-storyshots-puppeteer';
import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_imageSnapshots`;
testconfig.mysql.database = database;

const devApp = require( '../server.dev' ).default;

// Image snapshots
// We do screenshots against the static build of the storybook.
// For this test to be meaningful, you must build the static version of the storybook *before* running this test suite.
const pathToStorybookStatic = path.join( __dirname, '../', 'storybook-static' );

beforeAll( async () => {
  await promisify( devApp.server.listen ).call(
    devApp.server,
    process.env.STORYBOOK_API_PORT || 3302
  );

  process.env.STORYBOOK_API_PORT = devApp.server.address().port;

  await db.create( testconfig.mysql );

  abilities.init( testconfig );

  await abilities.config.migrate();
} );

beforeEach( async () => {
  await abilities.config.seed( 'firstTest' );
} );

afterAll( async () => {
  devApp.server.close();

  await abilities.config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await abilities.config.knex.destroy();
} );

if ( !fs.existsSync( pathToStorybookStatic ) ) {
  // eslint-disable-next-line no-console
  console.error(
    'You are running image snapshots without having the static build of storybook.'
      + ' Please run "yarn build-storybook" before running tests.'
  );
} else {
  initStoryshots( {
    suite: 'Image snapshots',
    framework: 'react',
    configPath: path.join( __dirname, '..', '.storybook' ),
    integrityOptions: { cwd: path.join( __dirname, 'stories' ) },
    test: imageSnapshot( {
      storybookUrl: `file://${pathToStorybookStatic}`,
      getMatchOptions: () => ( {
        failureThreshold: 0.02, // 2% threshold,
        failureThresholdType: 'percent'
      } ),
      getGotoOptions: ( /* { context, url } */ ) => ( {
        waitUntil: 'networkidle0'
      } )
    } )
  } );
}
