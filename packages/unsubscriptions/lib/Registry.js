import crypto from 'node:crypto';

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function initialize({ knex }) {
  if (await knex.schema.hasTable('unsubscription')) {
    return;
  }

  return knex.schema.createTable('unsubscription', table => {
    table.increments('id').primary().notNullable();
    table.string('email', 255).notNullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

function isRegistered({ knex }, email) {
  return knex('unsubscription')
    .first(['id'])
    .where('email', hash(email))
    .then(r => !!r);
}

async function add({ knex }, email, options = {}) {
  const {
    createdAt = new Date(),
  } = options;

  if (await isRegistered({ knex }, email)) {
    return;
  }
  return knex('unsubscription').insert({
    email: hash(email),
    created_at: createdAt,
  });
}

async function transfer({ knex }) {
  let count = 0;
  const query = knex.select('email', 'created_at').from('unsubscribed');

  const stream = await query.stream();

  for await (const row of stream) {
    await add({ knex }, row.email, { createdAt: row.created_at });
    count += 1;
  }

  return count;
}

export default function Registry(params) {
  return {
    add: add.bind(null, params),
    isRegistered: isRegistered.bind(null, params),
    transfer: transfer.bind(null, params),
    initialize: initialize.bind(null, params),
  };
}
