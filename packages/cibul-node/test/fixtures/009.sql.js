import seedApiKeys from './seedApiKeys.js';
import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/01.json'), // user id 1, uid 1
    load('sql/users/50300.json'), // new for test on custom
    load('sql/users/thibaud.json'),
    load('sql/users/lise.json'),
    load('sql/users/chrissie.json'),
    load('sql/users/helene.json'),
    load('sql/users/jean-benoit.json'),
    load('sql/users/steevie.json'),
  ]);

  await seedApiKeys(knex, [
    load('sql/apiKeys/01-pk.json'),
    load('sql/apiKeys/01-sk.json'),
    load('sql/apiKeys/lise-pk.json'),
    load('sql/apiKeys/lise-sk.json'),
    load('sql/apiKeys/chrissie-pk.json'),
    load('sql/apiKeys/chrissie-sk.json'),
  ]);

  const albiAgenda = load('./sql/agendas/albi.json'); // uid 48353388

  await knex('review').insert([
    load('sql/agendas/01.json'), // uid 1
    load('sql/agendas/02.json'), // uid 2
    load('sql/agendas/03.json'), // uid 3 with custom member schema
    load('sql/agendas/albigeois.json'), // uid 93399464
    {
      ...albiAgenda,
      settings:
        '{"tracking":{"googleAnalytics":null},"lab":{"eventAdmin":true,"status":false},"inbox":{"mailto":{"enabled":false,"email":null,"subject":null,"body":null}},"contribution":{"type":1,"defaultState":2,"canPublish":["administrators","moderators"],"moderateOnChangeBy":[],"defaultLang":null,"allowLocationCreate":true,"messages":{"instructions":null,"complete":null,"publication":null},"useFields":false,"authorizedIPAddresses":[]}}',
    },
  ]);

  await knex('network').insert([
    load('sql/networks/01.json'),
    load('sql/networks/albigeois.json'),
    load('sql/networks/albi.json'),
  ]);

  await knex('form_schema').insert([
    {
      id: 1,
      store: JSON.stringify({ fields: [] }),
    },
    load('form-schemas/albigeois.network.json', (fs) => ({
      id: 23483,
      store: JSON.stringify(fs),
    })),
    load('form-schemas/albigeois.agenda.json', (fs) => ({
      id: 23481,
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
    load('form-schemas/memberFormSchema.json', (fs) => ({
      id: 8,
      store: JSON.stringify(fs),
    })),
  ]);

  await knex('reviewer').insert([
    load('sql/members/01.json'), // user id 1, user uid 1, agenda uid 2, contributor
    load('sql/members/02.json'), // user uid 1, agenda uid 3, moderator
    load('sql/members/03.json'), // uid 1, id 1, agenda uid 9, administrator
    load('sql/members/04.json'), // contributor agenda uid 11
    load('sql/members/05.json'), // uid 5, agenda uid 2, contributor
    load('sql/members/06.json'), // uid 67, agenda uid 2, contributor
    load('sql/members/07.json'),
    load('sql/members/08.json'),
    load('sql/members/09.json'), // uid 6887, agenda uid 3, contributor
    load('sql/members/lise.administrator.json'), // uid 50073466, agenda 2, admin
  ]);

  await knex('custom').insert([
    load('sql/custom/01.json'), // id 1, identifier 6887,
  ]);
};
