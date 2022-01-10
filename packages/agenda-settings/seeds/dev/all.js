import path from 'path';
import keysSvc from '@openagenda/keys';
import agendasFixtures from '@openagenda/agendas/test/fixtures/load';

const agendasSvcRoot = path.dirname( require.resolve( '@openagenda/agendas/package.json' ) );

exports.seed = async knex => {
  const { testconfig } = knex.client.config;

  await agendasFixtures( {
    mysql: testconfig.mysql,
    files: [
      agendasSvcRoot + '/test/fixtures/resetDb.sql',
      agendasSvcRoot + '/model.sql',
      agendasSvcRoot + '/test/fixtures/agenda.data.sql',
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

  await keysSvc.init( { ...testconfig, knex, migrations: true } );
};
