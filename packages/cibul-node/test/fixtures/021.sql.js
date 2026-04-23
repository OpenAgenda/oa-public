import loadObjectFromFile from './loadObjectFromFile.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

export default async (knex) => {
  await knex('review').insert([
    load('sql/agendas/218.json', {
      uid: 1904,
      form_schema_id: null,
      credentials: JSON.stringify({ invitationMessage: true }),
    }),
  ]);

  await knex('user').insert([
    load('./sql/users/helene.json', { uid: 111, email: 'helene@testoa.com' }), // admin
    load('./sql/users/thibaud.json', { uid: 222, email: 'thibaud@testoa.com' }), // mod
    load('./sql/users/50304.json', { uid: 331, email: 'steve@testoa.com' }), // contributor with actions
    load('./sql/users/50300.json', { uid: 332, email: 'nestor@testoa.com' }), // contributor with no actions
  ]);

  await knex('reviewer').insert([
    load('./sql/members/71386687.json', {
      id: 1,
      agenda_uid: 1904,
      user_uid: 111,
      credential: 2,
      store: JSON.stringify({
        custom_fields: { email: 'helene@testmemberoa.com' },
      }),
    }),
    load('./sql/members/71386687.json', {
      id: 2,
      agenda_uid: 1904,
      user_uid: 222,
      credential: 3,
      store: JSON.stringify({
        custom_fields: { email: 'thibaud@testmemberoa.com' },
      }),
    }),
    load('./sql/members/71386687.json', {
      id: 3,
      agenda_uid: 1904,
      user_uid: 331,
      credential: 1,
      actions_counter: 3,
      store: JSON.stringify({
        custom_fields: { email: 'steve@testmemberoa.com' },
      }),
    }),
    load('./sql/members/71386687.json', {
      id: 4,
      agenda_uid: 1904,
      user_uid: 332,
      credential: 1,
      actions_counter: 0,
      store: JSON.stringify({}),
    }),
  ]);
};
