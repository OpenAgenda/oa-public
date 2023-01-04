'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  load('sql/agendas/218.json'),
  load('sql/agendas/219.json'),
  load('sql/agendas/221.json'),
]));

raw.push(knex('user').insert([
  load('sql/users/50304.json'),
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json', { user_id: 50304 }),
]));

raw.push(knex('form_schema').insert([
  load('form-schemas/2.json', fs => ({ id: 2, store: JSON.stringify(fs) })),
  load('form-schemas/4.json', fs => ({ id: 4, store: JSON.stringify(fs) })),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/71385.json'),
  load('sql/members/71386.json'),
]));

raw.push(knex('location').insert([{
  id: 1,
  uid: 123,
  agenda_id: 218,
  slug: 'la-boutique',
  placename: 'La boutique',
  address: '29 passage du Ponceau, Paris',
  city: 'Paris',
  country: 'FR',
  latitude: 48.867688,
  longitude: 2.351739,
  store: JSON.stringify({
    extId: 'fdsqfdsq',
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}]));

raw.push(knex('review_category').insert([{
  id: 3454,
  slug: 'animation-loto',
  category: 'Animation - Loto',
  review_id: 218,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 3455,
  slug: 'atelier',
  category: 'Atelier',
  review_id: 218,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 3456,
  slug: 'ceremonie',
  category: 'Cérémonie',
  review_id: 218,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 3457,
  slug: 'cinema-projection',
  category: 'Cinéma - Projection',
  review_id: 218,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}]));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify({
    categories: [
      {
        id: 3454,
        label: 'Animation - Loto',
        slug: 'animation-loto',
      },
      {
        id: 3455,
        label: 'Atelier',
        slug: 'atelier',
      },
      {
        id: 3456,
        label: 'Cérémonie',
        slug: 'ceremonie',
      },
      {
        id: 3457,
        label: 'Cinéma - Projection',
        slug: 'cinema-projection',
      },
    ],
  }),
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify({
    groups: [
      {
        tags: [
          {
            id: 9661,
            label: 'Administration',
            schemaOptionId: '2.3',
            slug: 'administration',
          },
          {
            id: 9662,
            label: 'Aéronautique',
            schemaOptionId: '2.4',
            slug: 'aeronautique',
          },
        ],
      },
    ],
  }),
}, {
  id: 219,
  store: JSON.stringify({ groups: [{ name: 'Entrée libre', tags: [{ id: 62941, label: 'Entrée libre', slug: 'true', schemaOptionId: '21.1' }], access: 'public', required: false, unique: false }, { name: 'Thématiques Métropolitaines', tags: [{ id: 22441, label: 'Culture', slug: 'culture', schemaOptionId: '21.3' }, { id: 22449, label: 'Economie - Innovation', slug: 'economie-innovation', schemaOptionId: '21.4' }, { id: 22446, label: 'Éducation', slug: 'education', schemaOptionId: '21.5' }, { id: 28250, label: 'Emploi', slug: 'emploi', schemaOptionId: '21.6' }, { id: 22450, label: 'International', slug: 'international', schemaOptionId: '21.7' }, { id: 22451, label: 'Loisirs', slug: 'loisirs', schemaOptionId: '21.8' }, { id: 22447, label: 'Nature - Environnement', slug: 'nature-environnement', schemaOptionId: '21.9' }, { id: 22453, label: 'Patrimoine', slug: 'patrimoine', schemaOptionId: '21.10' }, { id: 22454, label: 'Social - Santé', slug: 'social-sante', schemaOptionId: '21.11' }, { id: 23559, label: 'Sports', slug: 'sports', schemaOptionId: '21.12' }, { id: 22457, label: 'Transports - Déplacements', slug: 'transports-deplacements', schemaOptionId: '21.13' }, { id: 22458, label: 'Urbanisme', slug: 'urbanisme', schemaOptionId: '21.14' }], access: 'public', required: true, unique: false }, { name: "Types d'événements", tags: [{ id: 22459, label: 'Tous', slug: 'tous', schemaOptionId: '21.15' }, { id: 22460, label: 'Conférence', slug: 'conference', schemaOptionId: '21.16' }, { id: 22461, label: 'Congrès - Colloque', slug: 'congres-colloque', schemaOptionId: '21.17' }, { id: 22462, label: 'Conseil de Métropole', slug: 'conseil-de-metropole', schemaOptionId: '21.18' }, { id: 22463, label: 'Événement sportif', slug: 'evenement-sportif', schemaOptionId: '21.19' }, { id: 22464, label: 'Exposition', slug: 'exposition', schemaOptionId: '21.20' }, { id: 22465, label: 'Foire - Salon', slug: 'foire-salon', schemaOptionId: '21.21' }, { id: 22466, label: 'Fête - Festival', slug: 'fete-festival', schemaOptionId: '21.22' }, { id: 22467, label: 'Réunion publique', slug: 'reunion-publique', schemaOptionId: '21.23' }, { id: 22468, label: 'Spectacle', slug: 'spectacle', schemaOptionId: '21.24' }, { id: 22695, label: 'Stage - Atelier', slug: 'stage-atelier', schemaOptionId: '21.25' }], access: 'public', required: true, unique: false }, { name: 'Public', tags: [{ id: 22541, label: 'Tout Public', slug: 'tout-public', schemaOptionId: '21.26' }, { id: 22542, label: 'Adulte', slug: 'adulte', schemaOptionId: '21.27' }, { id: 22543, label: 'Jeune Public', slug: 'jeune-public', schemaOptionId: '21.28' }, { id: 22545, label: 'Personne en situation de handicap', slug: 'personne-en-situation-de-handicap', schemaOptionId: '21.29' }, { id: 23539, label: 'Professionnel', slug: 'professionnel', schemaOptionId: '21.30' }], access: 'public', required: true, unique: false }, { name: 'Organisateur', tags: [{ id: 22546, label: 'Collectivité', slug: 'collectivite', schemaOptionId: '21.31' }, { id: 22547, label: 'Association', slug: 'association', schemaOptionId: '21.32' }, { id: 22548, label: 'Partenaire', slug: 'partenaire', schemaOptionId: '21.33' }, { id: 22549, label: 'Particulier', slug: 'particulier', schemaOptionId: '21.34' }], access: 'public', required: false, unique: false }, { name: 'Participation', tags: [{ id: 23507, label: 'Entrée Libre', slug: 'entree-libre', schemaOptionId: '21.35' }], access: 'public', required: false, unique: true }, { name: 'Événement ponctuel', tags: [{ id: 48913, label: 'Événement ponctuel', slug: 'evenement-ponctuel', schemaOptionId: '21.36' }], access: 'public', required: false, unique: true }] }),
}]));

raw.push(knex('review_tag').insert([{
  id: 9661,
  slug: 'administration',
  review_id: 218,
  tag: 'Administration',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 9662,
  slug: 'aeronautique',
  review_id: 218,
  tag: 'Aéronotique',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 22441,
  review_id: 218,
  tag: 'Culture',
  slug: 'culture',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22446,
  review_id: 218,
  tag: 'Éducation',
  slug: 'education',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22447,
  review_id: 218,
  tag: 'Nature - Environnement',
  slug: 'nature-environnement',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22449,
  review_id: 218,
  tag: 'Economie - Innovation',
  slug: 'economie-innovation',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22450,
  review_id: 218,
  tag: 'International',
  slug: 'international',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22451,
  review_id: 218,
  tag: 'Loisirs',
  slug: 'loisirs',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22453,
  review_id: 218,
  tag: 'Patrimoine',
  slug: 'patrimoine',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22454,
  review_id: 218,
  tag: 'Social - Santé',
  slug: 'social-sante',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22457,
  review_id: 218,
  tag: 'Transports - Déplacements',
  slug: 'transports-deplacements',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22458,
  review_id: 218,
  tag: 'Urbanisme',
  slug: 'urbanisme',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22459,
  review_id: 218,
  tag: 'Tous',
  slug: 'tous',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22460,
  review_id: 218,
  tag: 'Conférence',
  slug: 'conference',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22461,
  review_id: 218,
  tag: 'Congrès - Colloque',
  slug: 'congres-colloque',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22462,
  review_id: 218,
  tag: 'Conseil de Métropole ',
  slug: 'conseil-de-metropole',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22463,
  review_id: 218,
  tag: 'Événement sportif ',
  slug: 'evenement-sportif',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22464,
  review_id: 218,
  tag: 'Exposition',
  slug: 'exposition',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22465,
  review_id: 218,
  tag: 'Foire - Salon',
  slug: 'foire-salon',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22466,
  review_id: 218,
  tag: 'Fête - Festival',
  slug: 'fete-festival',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22467,
  review_id: 218,
  tag: 'Réunion publique',
  slug: 'reunion-publique',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22468,
  review_id: 218,
  tag: 'Spectacle',
  slug: 'spectacle',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22541,
  review_id: 218,
  tag: 'Tout Public ',
  slug: 'tout-public',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22542,
  review_id: 218,
  tag: 'Adulte',
  slug: 'adulte',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22543,
  review_id: 218,
  tag: 'Jeune Public',
  slug: 'jeune-public',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22545,
  review_id: 218,
  tag: 'Personne en situation de handicap',
  slug: 'personne-en-situation-de-handicap',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22546,
  review_id: 218,
  tag: 'Collectivité',
  slug: 'collectivite',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22547,
  review_id: 218,
  tag: 'Association',
  slug: 'association',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22548,
  review_id: 218,
  tag: 'Partenaire',
  slug: 'partenaire',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22549,
  review_id: 218,
  tag: 'Particulier',
  slug: 'particulier',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 22695,
  review_id: 218,
  tag: 'Stage - Atelier',
  slug: 'stage-atelier',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 23507,
  review_id: 218,
  tag: 'Entrée Libre',
  slug: 'entree-libre',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 23539,
  review_id: 218,
  tag: 'Professionnel',
  slug: 'professionnel',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 23559,
  review_id: 218,
  tag: 'Sports',
  slug: 'sports',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 28250,
  review_id: 218,
  tag: 'Emploi',
  slug: 'emploi',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 48913,
  review_id: 218,
  tag: 'Événement ponctuel',
  slug: 'evenement-ponctuel',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
},
{
  id: 62941,
  review_id: 218,
  tag: 'Entrée libre',
  slug: 'entree-libre',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}]));

raw.push(knex('event').insert([{
  id: 1,
  uid: 19201989,
  slug: 'un-event',
  owner_id: 50304,
  created_at: '2019-12-14T10:00:00.000',
  updated_at: '2019-12-14T10:00:00.000',
}, {
  id: 2,
  uid: 19201978,
  slug: 'un-autre-event',
  owner_id: 50304,
  created_at: '2019-12-14T10:00:00.000',
  updated_at: '2019-12-14T10:00:00.000',
}, {
  id: 3,
  uid: 90298390,
  slug: 'encore-un-autre-event',
  owner_id: 50304,
  created_at: '2020-02-18T10:00:00.000',
  updated_at: '2020-02-18T10:00:00.000',
}]));

raw.push(knex('event_location').insert([{
  id: 1,
  location_id: 1,
  event_id: 1,
  created_at: '2019-12-14T10:00:00.000',
  updated_at: '2019-12-14T10:00:00.000',
}, {
  id: 2,
  location_id: 1,
  event_id: 2,
  created_at: '2019-12-14T10:00:00.000',
  updated_at: '2019-12-14T11:00:00.000',
}]));

raw.push(knex('occurrence').insert([{
  id: 1,
  location_id: 1,
  event_id: 1,
  date: '2019-05-06',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 2,
  location_id: 1,
  event_id: 2,
  date: '2019-05-08',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 3,
  location_id: 1,
  event_id: 3,
  date: '2020-02-18',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}]));

raw.push(knex('event_2').insert([{
  id: 12,
  uid: 19201989,
  slug: 'un-event',
  title: JSON.stringify({
    fr: 'Un event',
  }),
  description: JSON.stringify({
    fr: 'Une desc',
  }),
  draft: 0,
  timezone: 'Europe/Paris',
  owner_uid: 63170203,
  creator_uid: 63170203,
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00'),
  }]),
  location_uid: 123,
  agenda_uid: 17026855,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 13,
  uid: 19201978,
  slug: 'un-autre-event',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre event',
  }),
  description: JSON.stringify({
    fr: 'Une desc',
  }),
  draft: 0,
  timezone: 'Europe/Paris',
  timings: JSON.stringify([{
    begin: new Date('2019-05-08T10:00:00'),
    end: new Date('2019-05-08T11:00:00'),
  }]),
  location_uid: 123,
  agenda_uid: 17026855,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 14,
  uid: 89378913,
  slug: 'un-event-brouillon',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un event brouillon',
  }),
  description: JSON.stringify({
    fr: 'Une desc',
  }),
  draft: 1,
  timezone: 'Europe/Paris',
  timings: JSON.stringify([{
    begin: new Date('2019-05-08T10:00:00'),
    end: new Date('2019-05-08T11:00:00'),
  }]),
  location_uid: 123,
  agenda_uid: 17026855,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 15,
  uid: 90298390,
  slug: 'encore-un-autre-event',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Encore un autre event',
  }),
  description: JSON.stringify({
    fr: 'Une desc',
  }),
  draft: 0,
  timezone: 'Europe/Paris',
  timings: JSON.stringify([{
    begin: new Date('2020-02-18T10:00:00'),
    end: new Date('2020-02-18T18:00:00'),
  }]),
  location_uid: 123,
  agenda_uid: 17026855,
  created_at: new Date('2020-02-18T10:00:00'),
  updated_at: new Date('2020-02-18T10:00:00'),
}]));

raw.push(knex('agenda_event').insert([{
  id: 1,
  event_uid: 19201989,
  agenda_uid: 17026855,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 2,
  event_uid: 19201989,
  agenda_uid: 17026800,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 3,
  event_uid: 19201978,
  agenda_uid: 17026855,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 4,
  event_uid: 19201978,
  agenda_uid: 17026800,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 5,
  event_uid: 90298390,
  agenda_uid: 17026855,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2020-02-18T10:00:00'),
  updated_at: new Date('2020-02-18T10:00:00'),
  can_edit: 1,
}]));

raw.push(knex('review_article').insert([{
  id: 123,
  event_id: 1,
  review_id: 218,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 124,
  event_id: 1,
  review_id: 219,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 125,
  event_id: 2,
  review_id: 218,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 126,
  event_id: 2,
  review_id: 219,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 127,
  event_id: 3,
  review_id: 218,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}]));

raw.push(knex('custom').insert([{
  id: 9090,
  form_schema_id: 2,
  identifier: 19201989,
  store: JSON.stringify({
    'categories-agenda-metropolitain': 46,
  }),
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 9091,
  form_schema_id: 4,
  identifier: 19201989,
  store: JSON.stringify({
    'thematiques-metropolitaines': [3],
  }),
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}]));

module.exports = `${raw.join(';\n')};`;
