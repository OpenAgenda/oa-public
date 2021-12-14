'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const embeddedContent = require('./embeddedContent.json');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'),
  require('./sql/agendas/02.json')
]));

raw.push(knex('network').insert([
  require('./sql/networks/01.json')
]));

raw.push(knex('user').insert([
  require('./sql/users/01.json'),
  require('./sql/users/50300.json'),
  require('./sql/users/jean-benoit.json'),
  require('./sql/users/lise.json')
]));

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/50300.json'),
  require('./sql/apiKeySets/0101.json'),
  require('./sql/apiKeySets/jean-benoit.keys.json'),
  require('./sql/apiKeySets/lise.keys.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/01.json'), // contributor
  require('./sql/members/50300.admin.02.json'),
  {
    ...require('./sql/members/lise.contributor.albi.json'),
    agenda_uid: 2
  }
]));

raw.push(knex('location').insert([{
  id: 1,
  slug: 'la-boutique',
  placename: 'La boutique',
  address: '29 passage du ponceau, Paris',
  latitude: 48.867583,
  longitude: 2.3502635,
  uid: 1,
  created_at: new Date(),
  updated_at: new Date(),
  deleted: 1
}]));

raw.push(knex('event_2').insert([{
  id: 1,
  owner_uid: 1,
  agenda_uid: 1,
  creator_uid: 1,
  slug: 'event-1',
  uid: 1,
  draft: 0,
  title: JSON.stringify({
    fr: 'Evénement 1'
  }),
  description: JSON.stringify({
    fr: 'Description 1'
  }),
  long_description: JSON.stringify({
    fr: 'Description longue 1'
  }),
  timings: JSON.stringify([{
    begin: new Date('2019-09-27T10:00:00+0200'),
    end: new Date('2019-09-27T12:00:00+0200')
  }]),
  location_uid: 1,
  timezone: 'Europe/Paris',
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 2,
  owner_uid: 1,
  creator_uid: 1,
  agenda_uid: 1,
  slug: 'event-2',
  uid: 2,
  draft: 0,
  title: JSON.stringify({
    fr: 'Evénement 2'
  }),
  description: JSON.stringify({
    fr: 'Description 2'
  }),
  long_description: JSON.stringify(embeddedContent.longDescription),
  links: JSON.stringify(embeddedContent.links),
  timings: JSON.stringify([{
    begin: new Date('2019-09-27T10:00:00+0200'),
    end: new Date('2019-09-27T12:00:00+0200')
  }]),
  location_uid: 1,
  timezone: 'Europe/Paris',
  image: JSON.stringify({
    filename: '6fc4cb9253e54f50a61a7cf81a2eb1c1.base.image.jpg',
    size: {
      width: 700,
      height: 717
    },
    variants: [{
      filename: '6fc4cb9253e54f50a61a7cf81a2eb1c1.full.image.jpg',
      size: {
        width: 125,
        height: 128
      },
      type: 'full'
    }, {
      filename: '6fc4cb9253e54f50a61a7cf81a2eb1c1.thumb.image.jpg',
      size: {
        width: 200,
        height: 200
      },
      type: 'thumbnail'
    }],
    base: 'https://cibuldev.s3.amazonaws.com/',
    credits: 'Gaetan Latouche'
  }),
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 3,
  uid: 3,
  owner_uid: 1,
  creator_uid: 1,
  agenda_uid: 2,
  slug: 'draft-event',
  draft: 1,
  title: JSON.stringify({
    fr: 'Evénement brouillon'
  }),
  created_at: new Date(),
  updated_at: new Date()
}]));

raw.push(knex('agenda_event').insert([{
  id: 1,
  user_uid: 1,
  agenda_uid: 1,
  event_uid: 1,
  state: 2,
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 2,
  user_uid: 1,
  agenda_uid: 2,
  event_uid: 1,
  state: 0,
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 3,
  user_uid: null,
  agenda_uid: 2,
  state: 2,
  event_uid: 2,
  source_agenda_uid: JSON.stringify([[1]]),
  aggregated: 1,
  created_at: new Date(),
  updated_at: new Date()
}]));

raw.push(knex('form_schema').insert([{
  id: 1,
  store: JSON.stringify({
    fields: [{
      field: 'thematique',
      fieldType: 'radio',
      origin: 'tags',
      options: [{
        id: 1,
        value: 'concert',
        label: 'Concert'
      }, {
        id: 2,
        value: 'exposition',
        label: 'Exposition'
      }]
    }, {
      field: 'note',
      fieldType: 'text',
      origin: 'custom',
      read: ['administrator']
    }]
  })
}]));

raw.push(knex('custom').insert({
  id: 1,
  form_schema_id: 1,
  identifier: 1,
  store: JSON.stringify({
    thematique: 2,
    note: 'Une note interne pour les administrateurs'
  }),
  created_at: new Date(),
  updated_at: new Date()
}));

module.exports = raw.join(';\n') + ';';
