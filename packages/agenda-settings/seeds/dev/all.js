import path from 'node:path';
import keysSvc from '@openagenda/keys';
import agendasFixtures from '@openagenda/agendas/test/fixtures/load.js';

const agendasSvcRoot = path.dirname(
  import.meta.resolve('@openagenda/agendas/package.json'),
);

export async function seed(knex) {
  const { testconfig } = knex.client.config;

  await agendasFixtures({
    mysql: testconfig.mysql,
    files: [
      `${agendasSvcRoot}/test/fixtures/resetDb.sql`,
      `${agendasSvcRoot}/model.sql`,
      `${agendasSvcRoot}/test/fixtures/agenda.data.sql`,
    ],
    map: {
      database: testconfig.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      legacyCredential: 'legacy_credential_set',
    },
  });

  await keysSvc.init({ ...testconfig, knex, migrations: true });
}
