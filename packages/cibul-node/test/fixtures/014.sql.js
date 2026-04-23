import load from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/janine.json'),
    load('sql/users/lise.json'), // 50073466, id 125884
    load('sql/users/margaux.json'),
  ]);

  await knex('api_key_set').insert([
    load('sql/apiKeySets/01.json'), // keys of janine
    load('sql/apiKeySets/02.json', {
      // keys of lise
      user_id: 125884,
    }),
  ]);

  await knex('access_token').insert([
    load('sql/accessTokens/01.json'),
    load('sql/accessTokens/02.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/218.json'), // 17026855
    load('sql/agendas/219.json'), // 55268170
    load('sql/agendas/222.json'), // 55278973
    load('sql/agendas/arles.json'), // 99501607
    load('sql/agendas/albi.json'), // 48353388
    load('sql/agendas/albigeois.json'), // 93399464,
    load('sql/agendas/223.json'), // 49405812
  ]);

  await knex('reviewer').insert([
    load('sql/members/71385.json'), // agenda 17026855
    load('sql/members/71386.json'), // agenda 17026855
    load('sql/members/71387.json'), // agenda 17026855
    load('sql/members/71388.json'),
    load('sql/members/janine.admin.albigeois.json'), // janine admin on 93399464
    load('sql/members/janine.admin.lagargouille.json'), // janine admin on 17026855
    load('sql/members/janine.admin.albi.json'), // janine admin on 48353388
    load('sql/members/lise.contributor.albi.json'), // 93399464 (albigeois), 50073466 (lise)
    load('sql/members/margaux.administrator.albi.json'),
  ]);

  await knex('location_set').insert([load('sql/locations/set.json')]);

  await knex('location').insert([
    load('sql/locations/1.json'),
    load('sql/locations/2.json'),
    load('sql/locations/3.json'), // eventSet 3 (removed by core test)
    load('sql/locations/4.json'),
    load('sql/locations/5.json'),
    load('sql/locations/6.json'),
    load('sql/locations/7.json'), // eventSet 7 (removed by api test)
    load('sql/locations/8.json'), // eventSet 4 (removed by api test)
    load('sql/locations/9.json'), // eventSet 5
    load('sql/locations/chezVous.json'),
    load('sql/locations/museeToulouseLautrec.json'),
  ]);

  await knex('network').insert([
    load('sql/networks/albi.json'),
    load('sql/networks/albigeois.json'),
  ]);

  await insertEventSet(knex, 3);
  await insertEventSet(knex, 4);
  await insertEventSet(knex, 5);
  await insertEventSet(knex, 7);
  await insertEventSet(knex, 'videoReportage');
  await insertEventSet(knex, 'toulouseLautrec');

  await knex('location_set').insert([
    {
      uid: 478946547,
      title: 'Un jeu de lieux de test',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  await knex('form_schema').insert([
    load('form-schemas/1.json', (fs) => ({ id: 2, store: JSON.stringify(fs) })),
    {
      id: 3,
      store: JSON.stringify({
        fields: [],
        nextOptionId: 1,
      }),
    },
    load('form-schemas/albigeois.network.json', (fs) => ({
      id: 23483,
      store: JSON.stringify(fs),
    })),
    load('form-schemas/albi.network.json', (fs) => ({
      id: 73,
      store: JSON.stringify(fs),
    })),
    load('form-schemas/albi.agenda.json', (fs) => ({
      id: 10522,
      store: JSON.stringify(fs),
    })),
    load('form-schemas/albigeois.agenda.json', (fs) => ({
      id: 23481,
      store: JSON.stringify(fs),
    })),
  ]);
};
