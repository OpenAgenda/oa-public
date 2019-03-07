import path from 'path';
import { promisify } from 'util';
import fixtures from '@openagenda/fixtures';
import stakeholdersSvc from '@openagenda/agenda-stakeholders/test/service';
import agendasFixtures from '@openagenda/agendas/test/fixtures/load';

const agendasSvcRoot = path.dirname( require.resolve( '@openagenda/agendas/package.json' ) );

exports.seed = async knex => {
  const { testconfig } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( stakeholdersSvc.init )( testconfig );

  stakeholdersSvc.tasks.message();

  await agendasFixtures( {
    mysql: testconfig.mysql,
    files: [
      agendasSvcRoot + '/test/fixtures/resetDb.sql',
      agendasSvcRoot + '/model.sql',
      agendasSvcRoot + '/test/fixtures/occurrence.data.sql',
      agendasSvcRoot + '/test/fixtures/legacyCredentialSet.data.sql'
    ],
    map: {
      database: testconfig.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence',
      legacyCredential: 'legacy_credential_set'
    }
  } );

  await promisify( stakeholdersSvc.initAndLoad )( testconfig, { reset: false } );

  await promisify( fixtures )( [
    {
      table: 'user',
      src: path.resolve( __dirname, 'user.sql' )
    }, {
      table: 'api_key_set',
      src: path.resolve( __dirname, 'api_key_set.sql' )
    }
  ], { reset: false } );

};
