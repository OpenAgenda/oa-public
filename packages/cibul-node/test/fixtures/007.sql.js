'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');
const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();
const load = loadObjectFromFile({ cwd: __dirname });

raw.push(knex('agenda').insert([{
  id: 13901,
  title: 'Custom fielded agenda',
  slug: 'custom_fielded_agenda',
  owner_id: 1,
  uid: 60934473,
  form_schema_id: 26,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  store: JSON.stringify(`{
    "customFields": [ {
      "name": "cle_session",
      "label": {
        "fr": "Clé session",
        "en": "Clé session"
      },
      "info": {
        "fr": "Ce champ est complété automatiquement, merci de ne pas le modifier.",
        "en": "Ce champ est complété automatiquement, merci de ne pas le modifier."
      },
      "fieldType": "integer",
      "optional": true,
      "type": "private"
    } ]
  }`),
}, {
  id: 13902,
  title: 'Custom fielded agenda with network',
  slug: 'custom_fielded_agenda_with_network',
  owner_id: 1,
  uid: 60935574,
  form_schema_id: 26,
  network_uid: 1,
  member_schema_id: 8,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  store: JSON.stringify(`{
    "customFields": [ {
      "name": "cle_session",
      "label": {
        "fr": "Clé session",
        "en": "Clé session"
      },
      "info": {
        "fr": "Ce champ est complété automatiquement, merci de ne pas le modifier.",
        "en": "Ce champ est complété automatiquement, merci de ne pas le modifier."
      },
      "fieldType": "integer",
      "optional": true,
      "type": "private"
    } ]
  }`),
}]));

raw.push(knex('network').insert({
  id: 1,
  uid: 1,
  title: 'My very second network',
  form_schema_id: 27,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}));

raw.push(knex('user').insert([{
  id: 1,
  full_name: 'Kevin B.',
  uid: 92,
  password: 'xxx',
  salt: 'xxx',
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}, {
  id: 2,
  full_name: 'Clement L.',
  uid: 93,
  password: 'xxxx',
  salt: 'xxxx',
  created_at: '2018-01-11 13:07:08',
  updated_at: '2018-01-18 16:14:06',
}]));

raw.push(knex('api_key_set').insert([
  load('./sql/apiKeySets/01.json', { user_id: 1 }),
  load('./sql/apiKeySets/02.json', { user_id: 2 }),
]));

raw.push(knex('reviewer').insert([{
  id: 1,
  user_id: 1,
  review_id: 1,
  credential: 2,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  agenda_uid: 60935574,
  user_uid: 92,
}, {
  id: 2,
  user_id: 2,
  review_id: 1,
  credential: 1,
  created_at: '2018-01-11 13:07:08',
  updated_at: '2018-01-18 16:14:06',
  agenda_uid: 60935574,
  user_uid: 93,
}]));

raw.push(knex('location').insert({
  id: 1,
  slug: 'la-boutique',
  placename: 'La boutique',
  address: '29 passage du ponceau, Paris',
  latitude: 1,
  longitude: 1,
  uid: 65208887,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
}));

raw.push(knex('form_schema').insert([{
  id: 8,
  store: JSON.stringify(load('./form-schemas/memberFormSchema.json')),
}, {
  id: 27,
  store: `{
    "nextOptionId": 1,
    "fields": [ {
      "field" : "edition",
      "label" : {
        "fr" : "Edition",
        "en" : "Edition"
      },
      "info": null,
      "optional" : true,
      "fieldType" : "text"
    } ]
  }`,
}, {
  id: 26,
  store: `{
  "nextOptionId": 37,
  "fields": [
    {
      "field": "entreelibre",
      "label": {
        "fr": "Entrée libre",
        "en": "Free entrance"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "custom",
      "min": null,
      "max": null,
      "options": [
        {
          "id": 1,
          "value": "true",
          "label": {
            "fr": "Entrée libre",
            "en": "Free entrance"
          },
          "legacyId": null
        }
      ],
      "fieldType": "checkbox"
    },
    {
      "field": "thematiques-metropolitaines",
      "label": {
        "fr": "Thématiques Métropolitaines"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "tags",
      "min": null,
      "max": null,
      "options": [
        {
          "id": 2,
          "value": "toutes",
          "label": {
            "fr": "Toutes"
          },
          "legacyId": 27855
        },
        {
          "id": 3,
          "value": "culture",
          "label": {
            "fr": "Culture"
          },
          "legacyId": 27854
        },
        {
          "id": 4,
          "value": "dechets-recyclage",
          "label": {
            "fr": "Déchets recyclage"
          },
          "legacyId": 27856
        },
        {
          "id": 5,
          "value": "economie-innovation",
          "label": {
            "fr": "Economie - Innovation"
          },
          "legacyId": 27857
        },
        {
          "id": 6,
          "value": "education",
          "label": {
            "fr": "Éducation"
          },
          "legacyId": 27858
        },
        {
          "id": 7,
          "value": "international",
          "label": {
            "fr": "International"
          },
          "legacyId": 27859
        },
        {
          "id": 8,
          "value": "loisirs",
          "label": {
            "fr": "Loisirs"
          },
          "legacyId": 27860
        },
        {
          "id": 9,
          "value": "nature-environnement",
          "label": {
            "fr": "Nature - Environnement"
          },
          "legacyId": 27861
        },
        {
          "id": 10,
          "value": "patrimoine",
          "label": {
            "fr": "Patrimoine"
          },
          "legacyId": 27862
        },
        {
          "id": 11,
          "value": "sante",
          "label": {
            "fr": "Santé"
          },
          "legacyId": 27863
        },
        {
          "id": 12,
          "value": "solidarite",
          "label": {
            "fr": "Solidarité"
          },
          "legacyId": 27864
        },
        {
          "id": 13,
          "value": "sports",
          "label": {
            "fr": "Sports"
          },
          "legacyId": 27865
        },
        {
          "id": 14,
          "value": "transports-deplacements",
          "label": {
            "fr": "Transports - Déplacements"
          },
          "legacyId": 27867
        },
        {
          "id": 15,
          "value": "urbanisme",
          "label": {
            "fr": "Urbanisme"
          },
          "legacyId": 27866
        }
      ],
      "fieldType": "checkbox"
    },
    {
      "field": "types-devenements",
      "label": {
        "fr": "Types d'événements"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "tags",
      "min": null,
      "max": null,
      "options": [
        {
          "id": 16,
          "value": "tous",
          "label": {
            "fr": "Tous"
          },
          "legacyId": 27868
        },
        {
          "id": 17,
          "value": "conference",
          "label": {
            "fr": "Conférence"
          },
          "legacyId": 27869
        },
        {
          "id": 18,
          "value": "congres-colloque",
          "label": {
            "fr": "Congrès - Colloque"
          },
          "legacyId": 27870
        },
        {
          "id": 19,
          "value": "conseil-de-la-metropole",
          "label": {
            "fr": "Conseil de la métropole"
          },
          "legacyId": 27871
        },
        {
          "id": 20,
          "value": "evenement-sportif",
          "label": {
            "fr": "Événement sportif"
          },
          "legacyId": 27872
        },
        {
          "id": 21,
          "value": "exposition",
          "label": {
            "fr": "Exposition"
          },
          "legacyId": 27873
        },
        {
          "id": 22,
          "value": "foire-salon",
          "label": {
            "fr": "Foire - Salon"
          },
          "legacyId": 27874
        },
        {
          "id": 23,
          "value": "fete-festival",
          "label": {
            "fr": "Fête - Festival"
          },
          "legacyId": 27875
        },
        {
          "id": 24,
          "value": "reunion-publique",
          "label": {
            "fr": "Réunion publique"
          },
          "legacyId": 27876
        },
        {
          "id": 25,
          "value": "spectacle",
          "label": {
            "fr": "Spectacle"
          },
          "legacyId": 27878
        },
        {
          "id": 26,
          "value": "stage-atelier",
          "label": {
            "fr": "Stage - Atelier"
          },
          "legacyId": 27877
        }
      ],
      "fieldType": "checkbox"
    },
    {
      "field": "public",
      "label": {
        "fr": "Public"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "tags",
      "min": null,
      "max": null,
      "options": [
        {
          "id": 27,
          "value": "tout-public",
          "label": {
            "fr": "Tout Public"
          },
          "legacyId": 27879
        },
        {
          "id": 28,
          "value": "adulte",
          "label": {
            "fr": "Adulte"
          },
          "legacyId": 27880
        },
        {
          "id": 29,
          "value": "jeune-public",
          "label": {
            "fr": "Jeune Public"
          },
          "legacyId": 27881
        },
        {
          "id": 30,
          "value": "personne-en-situation-de-handicap",
          "label": {
            "fr": "Personne en situation de handicap"
          },
          "legacyId": 27882
        },
        {
          "id": 31,
          "value": "professionnel",
          "label": {
            "fr": "Professionnel"
          },
          "legacyId": 27883
        }
      ],
      "fieldType": "checkbox"
    },
    {
      "field": "organisateur",
      "label": {
        "fr": "Organisateur"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "tags",
      "min": null,
      "max": null,
      "options": [
        {
          "id": 32,
          "value": "collectivite",
          "label": {
            "fr": "Collectivité"
          },
          "legacyId": 27884
        },
        {
          "id": 33,
          "value": "association",
          "label": {
            "fr": "Association"
          },
          "legacyId": 27885
        },
        {
          "id": 34,
          "value": "partenaire",
          "label": {
            "fr": "Partenaire"
          },
          "legacyId": 27886
        },
        {
          "id": 35,
          "value": "particulier",
          "label": {
            "fr": "Particulier"
          },
          "legacyId": 27887
        }
      ],
      "fieldType": "checkbox"
    },
    {
      "field": "tag-group-4",
      "label": {
        "fr": "Tags"
      },
      "info": {
        "fr": "Participation"
      },
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "tags",
      "options": [
        {
          "id": 36,
          "value": "entree-libre",
          "label": {
            "fr": "Entrée Libre"
          },
          "legacyId": 27888
        }
      ],
      "fieldType": "radio"
    },
    {
      "field": "cle_session",
      "label": {
        "fr": "Clé session",
        "en": "Clé session"
      },
      "info": {
        "fr": "Ce champ est complété automatiquement, merci de ne pas le modifier.",
        "en": "Ce champ est complété automatiquement, merci de ne pas le modifier."
      },
      "sub": null,
      "placeholder": null,
      "write": "contributor",
      "read": "moderator",
      "optional": true,
      "origin": "custom",
      "min": null,
      "max": null,
      "fieldType": "integer"
    },
    {
      "field": "category-group",
      "label": {
        "fr": "Tags"
      },
      "info": null,
      "write": "contributor",
      "read": null,
      "optional": true,
      "origin": "categories",
      "options": [],
      "fieldType": "radio"
    }
  ]
}`,
}]));

module.exports = `${raw.join(';\n')};`;
