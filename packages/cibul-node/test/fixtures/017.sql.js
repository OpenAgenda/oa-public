'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  load('sql/agendas/218.json', {
    settings: JSON.stringify({
      contribution: {
        type: 1,
        defaultState: 1,
      },
    }),
  }),
  load('sql/agendas/219.json', {
    uid: 17026800,
    settings: JSON.stringify({}),
  }),
  load('sql/agendas/220.json', {
    uid: 92983929,
    form_schema_id: 6,
    network_uid: 1234,
    settings: JSON.stringify({
      contribution: {
        moderateOnChangeBy: ['contributor'],
      },
    }),
  }),
  load('sql/agendas/221.json', {
    uid: 37026800,
    settings: JSON.stringify({
      contribution: {
        canPublish: ['administrators'],
      },
    }),
  }),
  load('sql/agendas/officedutourismeroubaix.json'),
  load('sql/agendas/metropole-europeenne-de-lille.json'),
]));

raw.push(knex('user').insert([
  load('sql/users/50304.json'),
  load('sql/users/helene.json'),
  load('sql/users/chrissie.json'),
  load('sql/users/thibaud.json'),
]));

raw.push(knex('api_key_set').insert([
  { ...load('sql/apiKeySets/01.json'), user_id: 50304 },
]));

raw.push(knex('network').insert([
  load('sql/networks/withadminfield.json'),
  load('sql/networks/mel.json'),
]));

raw.push(knex('form_schema').insert(
  [2, 5, 6, 41].map(id => load(`form-schemas/${id}.json`, fs => ({ id, store: JSON.stringify(fs) }))),
));

raw.push(knex('reviewer').insert([
  load('sql/members/lechat.json'), // user 63170203 contributor of 17026855
  load('sql/members/ln-adm-rbx.json'), // user 10866730 admin of 64260763
  load('sql/members/chr-ctb-rbx.json'),
  load('sql/members/tb-adm-mel.json'), // user 82253124 admin of 89904399
  load('sql/members/ln-ctb-mel.json'),
  load('sql/members/71387.json'), // user 1 admin of agenda 17026855
]));

raw.push(knex('location').insert([
  load('sql/locations/boutique.json'),
  load('sql/locations/bobine.json'),
]));

const {
  review_category: reviewCategory,
  category_set: categorySet,
  tag_set: tagSet,
} = load('sql/legacy/218.json');

raw.push(knex('review_category').insert(reviewCategory));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify(categorySet),
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify(tagSet),
}]));

raw.push(knex('review_tag').insert([{
  id: 9661,
  slug: 'administration',
  review_id: 218,
  tag: 'Administration',
}, {
  id: 9662,
  slug: 'aeronautique',
  review_id: 218,
  tag: 'Aéronotique',
}].map(rt => ({
  ...rt,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}))));

raw.push(knex('event').insert([{
  id: 1,
  uid: 19201989,
  slug: 'un-event',
}, {
  id: 2,
  uid: 19390293,
  slug: 'un-autre-event',
}, {
  id: 3,
  uid: 19390294,
  slug: 'et-un-autre-event',
}].map(e => ({
  ...e,
  owner_id: 50304,
  created_at: '2019-12-14 10:00:00',
  updated_at: '2019-12-14 10:00:00',
}))));

raw.push(knex('event_location').insert(
  [1, 2, 3].map(id => ({
    id,
    event_id: id,
    location_id: 1,
    created_at: '2016-01-11 13:07:08',
    updated_at: '2016-01-18 16:14:06',
  })),
));

raw.push(knex('occurrence').insert([{
  id: 1,
  date: '2019-05-06',
}, {
  id: 2,
  date: '2019-12-18',
}, {
  id: 3,
  date: '2019-12-18',
}].map(o => ({
  ...o,
  event_id: o.id,
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  location_id: 1,
}))));

raw.push(knex('event_2').insert([{
  id: 12,
  uid: 19201989,
  slug: 'un-event',
  draft: 0,
  title: JSON.stringify({
    fr: 'Un événement',
    en: 'An event',
  }),
  owner_uid: 63170203,
  creator_uid: 63170203,
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00'),
  }]),
  description: JSON.stringify({ fr: 'Une desc.', en: 'A desc.' }),
  timezone: 'Europe/Paris',
  location_uid: 123,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  agenda_uid: 17026855,
}, {
  id: 13,
  uid: 83902931,
  draft: 1,
  slug: 'un-evenement-brouillon',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un brouillon',
  }),
  description: JSON.stringify({}),
  timezone: 'Europe/Paris',
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  agenda_uid: 17026855,
}, {
  id: 14,
  uid: 19390293,
  slug: 'un-autre-event',
  image: JSON.stringify({
    filename: 'fdqfsdq.jpg',
  }),
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00'),
  }]),
  draft: 0,
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre événement',
  }),
  description: JSON.stringify({ fr: 'Une description' }),
  timezone: 'Europe/Paris',
  location_uid: 123,
  agenda_uid: 92983929,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 15,
  uid: 19390294,
  slug: 'et-un-autre-event',
  draft: 0,
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre événement',
  }),
  description: JSON.stringify({ fr: 'Une desc.' }),
  timezone: 'Europe/Paris',
  location_uid: 123,
  agenda_uid: 92983929,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 16,
  uid: 83902932,
  draft: 1,
  slug: 'un-autre-evenement-brouillon',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre brouillon',
  }),
  description: JSON.stringify({ fr: 'Une desc.' }),
  timezone: 'Europe/Paris',
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 17,
  uid: 99999999,
  draft: 0,
  slug: 'un-evenement-can-cannot-edit',
  owner_uid: 1,
  creator_uid: 1,
  title: JSON.stringify({
    fr: 'Un autre événement',
  }),
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00'),
  }]),
  location_uid: 123,
  description: JSON.stringify({ fr: 'Une desc.' }),
  timezone: 'Europe/Paris',
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 18,
  uid: 88888888,
  draft: 0,
  slug: 'un-evenement-sur-un-agenda-qui-ne-laisse-pas-mod-publish',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Encore un autre événement',
  }),
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00'),
  }]),
  location_uid: 123,
  description: JSON.stringify({ fr: 'Une desc.' }),
  timezone: 'Europe/Paris',
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}]));

raw.push(knex('agenda_event').insert([{
  id: 1,
  event_uid: 19201989,
  agenda_uid: 17026855,
  user_uid: 1,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 2,
  event_uid: 19390293,
  agenda_uid: 92983929,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 3,
  event_uid: 19390294,
  agenda_uid: 92983929,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 4,
  event_uid: 99999999,
  agenda_uid: 17026855,
  can_edit: 1,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 5,
  event_uid: 99999999,
  agenda_uid: 92983929,
  can_edit: 0,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 6,
  event_uid: 19390293,
  agenda_uid: 17026855,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1,
}, {
  id: 7,
  event_uid: 88888888,
  agenda_uid: 37026800,
  can_edit: 1,
  user_uid: 63170203,
  state: 1,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
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
  event_id: 2,
  review_id: 220,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}, {
  id: 125,
  event_id: 3,
  review_id: 220,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
}]));

raw.push(knex('custom').insert([{
  id: 1,
  form_schema_id: 5,
  identifier: 19390293,
  store: JSON.stringify({
    'organisation-interne': 'Il faut que Thérèse y soit',
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 2,
  form_schema_id: 6,
  identifier: 19390293,
  store: JSON.stringify({
    categories: 1,
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 3,
  form_schema_id: 5,
  identifier: 19390294,
  store: JSON.stringify({
    'organisation-interne': 'Il faut que Thérèse y soit',
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 4,
  form_schema_id: 6,
  identifier: 19390294,
  store: JSON.stringify({
    categories: 2,
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}]));

raw.push(knex('form_schema').insert([
  load('form-schemas/374.json', fs => ({ id: 374, store: JSON.stringify(fs) })),
]));

insertEventSet(knex, raw, 'lesUnsLesAutres');

module.exports = `${raw.join(';\n')};`;
