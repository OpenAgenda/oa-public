import logs from '@openagenda/logs';

const log = logs('set');

async function createUid(knex, schemas, data) {
  const MAX_TRIES = 100;

  for (let i = 0; i < 100; i++) {
    const uid = String(Math.ceil(Math.random() * 99999999));

    const existing = await knex(schemas.agenda).where('uid', uid).first();

    if (!existing) {
      data.data.uid = uid;
      log('created uid %s', uid);
      return data;
    }
  }

  throw new Error(
    `Unable to generate a unique UID after ${MAX_TRIES} attempts.`,
  );
}

export default createUid;
