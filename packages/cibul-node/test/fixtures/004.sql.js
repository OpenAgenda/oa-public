'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([{
  id: 218,
  uid: 17026855,
  title: 'La Gargouille',
  slug: 'la-gargouille',
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  private: 0,
  credentials: '{}',
  form_schema_id: 2,
  settings: JSON.stringify({
    contribution: {
      type: 1
    }
  })
}, {
  id: 219,
  uid: 17026800,
  title: 'Le Fennec',
  slug: 'le-fennec',
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 3,
  settings: JSON.stringify({})
}, {
  id: 220,
  uid: 92983929,
  title: 'Un agenda avec un champ contributeur',
  slug: 'agenda-champ-contributeur',
  description: 'Voilà',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 6,
  network_uid: 1234,
  settings: JSON.stringify({})
}]));

raw.push(knex('user').insert([
  require('./sql/users/50304.json')
]));

raw.push(knex('api_key_set').insert([
  { ...require('./sql/apiKeySets/01.json'), user_id: 50304 }
]));

raw.push(knex('network').insert([{
  id: 1,
  uid: 1234,
  title: 'Un réseau avec un champ admin',
  form_schema_id: 5,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

raw.push(knex('form_schema').insert([2, 5, 6].map(id => ({
  id,
  store: fs.readFileSync(`${__dirname}/form-schemas/${id}.json`)
}))));

raw.push(knex('reviewer').insert([{
  id: 71385,
  user_id: 50304,
  review_id: 218,
  user_uid: 63170203,
  agenda_uid: 17026855,
  credential: 1,
  created_at: '2017-10-30 14:21:07',
  updated_at: '2017-10-30 14:21:07',
  store: JSON.stringify({
    custom_fields:{
      organization: 'Le Chat Fume',
      contact_number: '0688996549',
      contact_name: "Th\\u00e9o Jouanneau",
      contact_position: 'directeur artistique',
      email: 'hello@lechatfume.fr'
    }
  }),
  organization: 'le-chat-fume',
  deleted_user: 0,
  actions_counter: 1
}]));

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
    extId: 'fdsqfdsq'
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

const {
  review_category,
  category_set,
  tag_set
} = require('./sql/legacy/218.json');

raw.push(knex('review_category').insert(review_category));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify(category_set)
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify(tag_set),
}]));

raw.push(knex('review_tag').insert([{
  id: 9661,
  slug: 'administration',
  review_id: 218,
  tag: 'Administration',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 9662,
  slug: 'aeronautique',
  review_id: 218,
  tag: 'Aéronotique',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

raw.push(knex('event').insert([{
  id: 1,
  uid: 19201989,
  slug: 'un-event',
  owner_id: 50304,
  created_at: '2019-12-14 10:00:00',
  updated_at: '2019-12-14 10:00:00'
}, {
  id: 2,
  uid: 19390293,
  slug: 'un-autre-event',
  owner_id: 50304,
  created_at: '2019-12-14 10:00:00',
  updated_at: '2019-12-14 10:00:00'
}, {
  id: 3,
  uid: 19390294,
  slug: 'et-un-autre-event',
  owner_id: 50304,
  created_at: '2019-12-14 10:00:00',
  updated_at: '2019-12-14 10:00:00'
}]));

raw.push(knex('event_location').insert([{
  id: 1,
  location_id: 1,
  event_id: 1,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 2,
  location_id: 1,
  event_id: 2,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 3,
  location_id: 1,
  event_id: 3,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

raw.push(knex('occurrence').insert([{
  id: 1,
  location_id: 1,
  event_id: 1,
  date: '2019-05-06',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 2,
  location_id: 1,
  event_id: 2,
  date: '2019-12-18',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 3,
  location_id: 1,
  event_id: 3,
  date: '2019-12-18',
  time_start: '10:00:00',
  time_end: '11:00:00',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

raw.push(knex('event_2').insert([{
  id: 12,
  uid: 19201989,
  slug: 'un-event',
  draft: 0,
  title: JSON.stringify({
    fr: 'Un événement'
  }),
  owner_uid: 63170203,
  creator_uid: 63170203,
  timings: JSON.stringify([{
    begin: new Date('2019-05-06T10:00:00'),
    end: new Date('2019-05-06T11:00:00')
  }]),
  description: JSON.stringify({}),
  timezone: 'Europe/Paris',
  location_uid: 123,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  agenda_uid: 17026855
}, {
  id: 13,
  uid: 83902931,
  draft: 1,
  slug: 'un-evenement-brouillon',
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un brouillon'
  }),
  description: JSON.stringify({}),
  timezone: 'Europe/Paris',
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}, {
  id: 14,
  uid: 19390293,
  slug: 'un-autre-event',
  image: JSON.stringify({
    filename: 'fdqfsdq.jpg'
  }),
  draft: 0,
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre événement'
  }),
  description: JSON.stringify({}),
  timezone: 'Europe/Paris',
  location_uid: 123,
  agenda_uid: 92983929,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}, {
  id: 15,
  uid: 19390294,
  slug: 'et-un-autre-event',
  draft: 0,
  owner_uid: 63170203,
  creator_uid: 63170203,
  title: JSON.stringify({
    fr: 'Un autre événement'
  }),
  description: JSON.stringify({}),
  timezone: 'Europe/Paris',
  location_uid: 123,
  agenda_uid: 92983929,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}]));

raw.push(knex('agenda_event').insert([{
  id: 1,
  event_uid: 19201989,
  agenda_uid: 17026855,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1
}, {
  id: 2,
  event_uid: 19390293,
  agenda_uid: 92983929,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1
}, {
  id: 3,
  event_uid: 19390294,
  agenda_uid: 92983929,
  user_uid: 63170203,
  state: 2,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00'),
  can_edit: 1
}]));

raw.push(knex('review_article').insert([{
  id: 123,
  event_id: 1,
  review_id: 218,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}, {
  id: 124,
  event_id: 2,
  review_id: 220,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}, {
  id: 125,
  event_id: 3,
  review_id: 220,
  state: 2,
  is_published: 1,
  user_id: 50304,
  created_at: new Date('2019-05-06T10:00:00'),
  updated_at: new Date('2019-05-06T10:00:00')
}]));

raw.push(knex('custom').insert([{
  id: 1,
  form_schema_id: 5,
  identifier: 19390293,
  store: JSON.stringify({
    'organisation-interne': 'Il faut que Thérèse y soit'
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 2,
  form_schema_id: 6,
  identifier: 19390293,
  store: JSON.stringify({
    categories: 1
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 3,
  form_schema_id: 5,
  identifier: 19390294,
  store: JSON.stringify({
    'organisation-interne': 'Il faut que Thérèse y soit'
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}, {
  id: 4,
  form_schema_id: 6,
  identifier: 19390294,
  store: JSON.stringify({
    categories: 2
  }),
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

module.exports = raw.join(';\n') + ';';
