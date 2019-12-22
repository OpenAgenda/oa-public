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
  uid: 55268170,
  title: 'La Gourgaille',
  slug: 'la-gourgaille',
  description: 'Une description petite',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 3,
  settings: JSON.stringify({})
}, {
  id: 220,
  uid: 58025176,
  title: 'La Gargule',
  slug: 'la-gargule',
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 3,
  settings: JSON.stringify({
    contribution: {
      type: 1
    }
  })
}]));

raw.push(knex('user').insert([
  require('./sql/users/50304.json'),
  require('./sql/users/50300.json')
]));

raw.push(knex('api_key_set').insert([
  { ...require('./sql/apiKeySets/01.json'), user_id: 50304 }
]));

raw.push(knex('form_schema').insert([{
  id: 2,
  store: fs.readFileSync(`${__dirname}/form-schemas/1.json`)
}, {
  id: 3,
  store: JSON.stringify({
    fields: [],
    nextOptionId: 1
  })
}]));

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
      organization:"Le Chat Fume",
      contact_number:"0688996549",
      contact_name:"Th\\u00e9o Jouanneau",
      contact_position:"directeur artistique",
      email:"hello@lechatfume.fr"
    }
  }),
  organization: 'le-chat-fume',
  deleted_user: 0,
  actions_counter: 1
}, {
  id: 71386,
  user_id: 50300,
  review_id: 218,
  user_uid: 63170200,
  agenda_uid: 17026855,
  credential: 1,
  created_at: '2017-10-30 14:21:07',
  updated_at: '2017-10-30 14:21:07',
  store: JSON.stringify({
    custom_fields:{
      organization:"Le Chat Fume",
      contact_number:"0688996549",
      contact_name:"Th\\u00e9o Jouanneau",
      contact_position:"directeur artistique",
      email:"hello@lechiensepique.fr"
    }
  }),
  organization: 'le-chien-se-pique',
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
  })
}]));

raw.push(knex('review_category').insert([{
  id: 3454,
  slug: 'animation-loto',
  category: 'Animation - Loto',
  review_id: 218
}, {
  id: 3455,
  slug: 'atelier',
  category: 'Atelier',
  review_id: 218
}, {
  id: 3456,
  slug: 'ceremonie',
  category: 'Cérémonie',
  review_id: 218
}, {
  id: 3457,
  slug: 'cinema-projection',
  category: 'Cinéma - Projection',
  review_id: 218
}]));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify({
    categories: [
      {
        "id": 3454,
        "label": "Animation - Loto",
        "slug": "animation-loto"
      },
      {
        "id": 3455,
        "label": "Atelier",
        "slug": "atelier"
      },
      {
        "id": 3456,
        "label": "Cérémonie",
        "slug": "ceremonie"
      },
      {
        "id": 3457,
        "label": "Cinéma - Projection",
        "slug": "cinema-projection"
      }
    ]
  })
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify({
    groups: [
      {
        tags: [
          {
            id: 9661,
            label: "Administration",
            schemaOptionId: '2.3',
            slug: "administration"
          },
          {
            id: 9662,
            label: "Aéronautique",
            schemaOptionId: '2.4',
            slug: "aeronautique"
          }
        ]
      }
    ]
  })
}]));

module.exports = raw.join(';\n') + ';';
