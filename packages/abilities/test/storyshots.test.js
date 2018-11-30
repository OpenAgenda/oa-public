/**
 * @jest-environment jsdom
 */

import path from 'path';
import { promisify } from 'util';
import initStoryshots, {
  Stories2SnapsConverter
} from '@storybook/addon-storyshots';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';
import { server } from '../server.dev';

const database = `${testconfig.mysql.database}_storyshots`;
testconfig.mysql.database = database;

configure( { adapter: new Adapter() } );

beforeAll( async () => {
  await promisify( server.listen ).call( server, process.env.STORYBOOK_API_PORT || 3301 );

  process.env.STORYBOOK_API_PORT = server.address().port;

  await db.create( testconfig.mysql );

  abilities.init( testconfig );

  await abilities.config.migrate();
} );

beforeEach( async () => {
  await abilities.config.seed( 'firstTest' );
} );

afterAll( async () => {
  server.close();

  await abilities.config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await abilities.config.knex.destroy();
} );

initStoryshots( {
  suite: 'Storyshots',
  framework: 'react',
  configPath: path.join( __dirname, '..', '.storybook' ),
  integrityOptions: { cwd: path.join( __dirname, 'stories' ) },
  asyncJest: true,
  test: ( { story, context, done } ) => {
    const converter = new Stories2SnapsConverter();
    const snapshotFilename = converter.getSnapshotFileName( context );
    const renderedStory = story.render( context );

    // mount the story
    const wrapper = mount( renderedStory.element || renderedStory );

    // wait until the mount is updated, in our app mostly by Relay
    // but maybe something else updating the state of the component
    // somewhere
    const waitTime = renderedStory.jestWaitTime || 1;

    setTimeout( () => {
      if ( snapshotFilename ) {
        expect(
          toJson( wrapper.update(), { noKey: true } )
        ).toMatchSpecificSnapshot( snapshotFilename );
      }

      done();
    }, waitTime );
  }
} );
