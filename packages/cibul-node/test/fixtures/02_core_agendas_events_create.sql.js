'use strict';

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

raw.push(knex('user').insert([{
  id: 50304,
  uid: 63170203,
  full_name: 'steve',
  email: 'steve@oa.com',
  culture: 'fr',
  is_activated: 1,
  password: 'a3bcf2ede1e72cf6123d1226d5d079bf03b68d65',
  salt: '6OLumvJLubAklsDhuJJiuVQJTAX8MfF3',
  created_at: '2017-11-15 15:50:11',
  updated_at: '2017-11-15 15:50:30',
}, {
  id: 50300,
  uid: 63170200,
  full_name: 'janine',
  email: 'janine@oa.com',
  culture: 'fr',
  is_activated: 1,
  password: 'a3bcf2ede1e72cf6123d1226d5d079bf03b68d65',
  salt: '6OLumvJLubAklsDhuJJiuVQJTAX8MfF3',
  created_at: '2017-11-15 15:50:11',
  updated_at: '2017-11-15 15:50:30'
}]));

raw.push(knex('form_schema').insert([{
  id: 2,
  store: JSON.stringify({
    fields: [
      {
        "field": "custom_description",
        "fieldType": "textarea",
        "info": null,
        "label": {
          "en": "Custom description",
          "fr": "Description personnalisée"
        },
        "max": null,
        "min": null,
        "optional": true,
        "origin": "custom",
        "read": ['moderator'],
        "write": ['moderator']
      },
      {
        "field": "title",
        "fieldType": "abstract"
      },
      {
        "field": "location",
        "fieldType": "abstract"
      },
      {
        "field": "intermunicipal_interest",
        "fieldType": "checkbox",
        "info": null,
        "label": {
          "en": "Event of inter-municipal interest",
          "fr": "Événement d''intérêt intercommunal"
        },
        "max": null,
        "min": null,
        "optional": true,
        "options": [
          {
            "id": 1,
            "label": {
              "en": "Event of inter-municipal interest",
              "fr": "Événement d''intérêt intercommunal"
            },
            "legacyId": null,
            "value": "true"
          }
        ],
        "origin": "custom",
        "read": null,
        "write": "contributor"
      },
      {
        "field": "recurring",
        "fieldType": "checkbox",
        "info": null,
        "label": {
          "en": "Recurring Event",
          "fr": "Événement récurrent"
        },
        "max": null,
        "min": null,
        "optional": true,
        "options": [
          {
            "id": 2,
            "label": {
              "en": "Recurring Event",
              "fr": "Événement récurrent"
            },
            "legacyId": null,
            "value": "true"
          }
        ],
        "origin": "custom",
        "read": null,
        "write": "contributor"
      },
      {
        "field": "thematiques-bordeaux-metropole",
        "fieldType": "checkbox",
        "info": null,
        "label": {
          "fr": "Thématiques Bordeaux Métropole"
        },
        "max": null,
        "min": null,
        "optional": true,
        "options": [
          {
            "id": 3,
            "label": {
              "fr": "Administration"
            },
            "value": "administration"
          },
          {
            "id": 4,
            "label": {
              "fr": "Aéronautique"
            },
            "value": "aeronautique"
          },
          {
            "id": 5,
            "label": {
              "fr": "Agroalimentaire"
            },
            "legacyId": 9663,
            "value": "agroalimentaire"
          },
          {
            "id": 6,
            "label": {
              "fr": "Archéologie préventive"
            },
            "legacyId": 9664,
            "value": "archeologie-preventive"
          },
          {
            "id": 7,
            "label": {
              "fr": "Citoyenneté"
            },
            "legacyId": 9665,
            "value": "citoyennete"
          },
          {
            "id": 8,
            "label": {
              "fr": "Consommation d’énergie"
            },
            "legacyId": 9666,
            "value": "consommation-denergie"
          },
          {
            "id": 9,
            "label": {
              "fr": "Culture"
            },
            "legacyId": 9667,
            "value": "culture"
          },
          {
            "id": 10,
            "label": {
              "fr": "Déchets - Recyclage"
            },
            "legacyId": 9668,
            "value": "dechets-recyclage"
          },
          {
            "id": 11,
            "label": {
              "fr": "Développement durable"
            },
            "legacyId": 9669,
            "value": "developpement-durable"
          },
          {
            "id": 12,
            "label": {
              "fr": "Eau et assainissement"
            },
            "legacyId": 9670,
            "value": "eau-et-assainissement"
          },
          {
            "id": 13,
            "label": {
              "fr": "Économie"
            },
            "legacyId": 9671,
            "value": "economie"
          },
          {
            "id": 14,
            "label": {
              "fr": "Éducation - Enseignement"
            },
            "legacyId": 9672,
            "value": "education-enseignement"
          },
          {
            "id": 15,
            "label": {
              "fr": "Emploi"
            },
            "legacyId": 9673,
            "value": "emploi"
          },
          {
            "id": 16,
            "label": {
              "fr": "Enfance"
            },
            "legacyId": 9674,
            "value": "enfance"
          },
          {
            "id": 17,
            "label": {
              "fr": "Environnement"
            },
            "legacyId": 9675,
            "value": "environnement"
          },
          {
            "id": 18,
            "label": {
              "fr": "Finances"
            },
            "legacyId": 9676,
            "value": "finances"
          },
          {
            "id": 19,
            "label": {
              "fr": "Grand projet"
            },
            "legacyId": 9677,
            "value": "grand-projet"
          },
          {
            "id": 20,
            "label": {
              "fr": "Habitat"
            },
            "legacyId": 9678,
            "value": "habitat"
          },
          {
            "id": 21,
            "label": {
              "fr": "Innovation"
            },
            "legacyId": 9679,
            "value": "innovation"
          },
          {
            "id": 22,
            "label": {
              "fr": "International"
            },
            "legacyId": 9680,
            "value": "international"
          },
          {
            "id": 23,
            "label": {
              "fr": "Loisirs"
            },
            "legacyId": 9681,
            "value": "loisirs"
          },
          {
            "id": 24,
            "label": {
              "fr": "Métropole"
            },
            "legacyId": 9682,
            "value": "metropole"
          },
          {
            "id": 25,
            "label": {
              "fr": "Nature"
            },
            "legacyId": 9683,
            "value": "nature"
          },
          {
            "id": 26,
            "label": {
              "fr": "Nautisme - Garonne"
            },
            "legacyId": 9684,
            "value": "nautisme-garonne"
          },
          {
            "id": 27,
            "label": {
              "fr": "Numérique"
            },
            "legacyId": 9685,
            "value": "numerique"
          },
          {
            "id": 28,
            "label": {
              "fr": "OIM"
            },
            "legacyId": 9686,
            "value": "oim"
          },
          {
            "id": 29,
            "label": {
              "fr": "Participation"
            },
            "legacyId": 9687,
            "value": "participation"
          },
          {
            "id": 30,
            "label": {
              "fr": "Patrimoine"
            },
            "legacyId": 9688,
            "value": "patrimoine"
          },
          {
            "id": 31,
            "label": {
              "fr": "Politique"
            },
            "legacyId": 9689,
            "value": "politique"
          },
          {
            "id": 32,
            "label": {
              "fr": "Santé"
            },
            "legacyId": 9690,
            "value": "sante"
          },
          {
            "id": 33,
            "label": {
              "fr": "Solidarité"
            },
            "legacyId": 9691,
            "value": "solidarite"
          },
          {
            "id": 34,
            "label": {
              "fr": "Sport"
            },
            "legacyId": 9692,
            "value": "sport"
          },
          {
            "id": 35,
            "label": {
              "fr": "Tertiaire"
            },
            "legacyId": 9693,
            "value": "tertiaire"
          },
          {
            "id": 36,
            "label": {
              "fr": "Tourisme"
            },
            "legacyId": 9694,
            "value": "tourisme"
          },
          {
            "id": 37,
            "label": {
              "fr": "Tramway"
            },
            "legacyId": 9695,
            "value": "tramway"
          },
          {
            "id": 38,
            "label": {
              "fr": "Transports - Déplacements"
            },
            "legacyId": 9696,
            "value": "transports-deplacements"
          },
          {
            "id": 39,
            "label": {
              "fr": "Travaux - chantiers"
            },
            "legacyId": 9697,
            "value": "travaux-chantiers"
          },
          {
            "id": 40,
            "label": {
              "fr": "Urbanisme"
            },
            "legacyId": 9698,
            "value": "urbanisme"
          },
          {
            "id": 41,
            "label": {
              "fr": "Vie associative"
            },
            "legacyId": 9699,
            "value": "vie-associative"
          }
        ],
        "origin": "tags",
        "read": null,
        "write": "contributor"
      },
      {
        "field": "bordeaux-metropole",
        "fieldType": "checkbox",
        "info": null,
        "label": {
          "fr": "Bordeaux Métropole"
        },
        "max": null,
        "min": null,
        "optional": true,
        "options": [],
        "origin": "tags",
        "read": null,
        "write": "contributor"
      },
      {
        "field": "categories-agenda-metropolitain",
        "fieldType": "radio",
        "info": null,
        "label": {
          "fr": "Catégories Agenda Métropolitain"
        },
        "optional": false,
        "options": [
          {
            "id": 42,
            "label": {
              "fr": "Animation - Loto"
            },
            "legacyId": 3454,
            "value": "animation-loto"
          },
          {
            "id": 43,
            "label": {
              "fr": "Atelier"
            },
            "legacyId": 3455,
            "value": "atelier"
          },
          {
            "id": 44,
            "label": {
              "fr": "Cérémonie"
            },
            "legacyId": 3456,
            "value": "ceremonie"
          },
          {
            "id": 45,
            "label": {
              "fr": "Cinéma - Projection"
            },
            "legacyId": 3457,
            "value": "cinema-projection"
          },
          {
            "id": 46,
            "label": {
              "fr": "Concert"
            },
            "legacyId": 3458,
            "value": "concert"
          },
          {
            "id": 47,
            "label": {
              "fr": "Conférence - Rencontre"
            },
            "legacyId": 3459,
            "value": "conference-rencontre"
          },
          {
            "id": 48,
            "label": {
              "fr": "Congrès - Colloque"
            },
            "legacyId": 3460,
            "value": "congres-colloque"
          },
          {
            "id": 49,
            "label": {
              "fr": "Conseil de métropole"
            },
            "legacyId": 3461,
            "value": "conseil-de-metropole"
          },
          {
            "id": 50,
            "label": {
              "fr": "Conseil municipal"
            },
            "legacyId": 3462,
            "value": "conseil-municipal"
          },
          {
            "id": 51,
            "label": {
              "fr": "Événement sportif"
            },
            "legacyId": 3463,
            "value": "evenement-sportif"
          },
          {
            "id": 52,
            "label": {
              "fr": "Exposition"
            },
            "legacyId": 3464,
            "value": "exposition"
          },
          {
            "id": 53,
            "label": {
              "fr": "Fête - Festival"
            },
            "legacyId": 3465,
            "value": "fete-festival"
          },
          {
            "id": 54,
            "label": {
              "fr": "Foire - Salon"
            },
            "legacyId": 3466,
            "value": "foire-salon"
          },
          {
            "id": 55,
            "label": {
              "fr": "Inauguration"
            },
            "legacyId": 3467,
            "value": "inauguration"
          },
          {
            "id": 56,
            "label": {
              "fr": "Lecture"
            },
            "legacyId": 3468,
            "value": "lecture"
          },
          {
            "id": 57,
            "label": {
              "fr": "Marché-Brocante - Vide grenier"
            },
            "legacyId": 3469,
            "value": "marche-brocante-vide-grenier"
          },
          {
            "id": 58,
            "label": {
              "fr": "Réunion publique"
            },
            "legacyId": 3470,
            "value": "reunion-publique"
          },
          {
            "id": 59,
            "label": {
              "fr": "Spectacle"
            },
            "legacyId": 3471,
            "value": "spectacle"
          },
          {
            "id": 60,
            "label": {
              "fr": "Visite - Balade"
            },
            "legacyId": 3472,
            "value": "visite-balade"
          }
        ],
        "origin": "categories",
        "read": null,
        "write": "contributor"
      }
    ],
    nextOptionId: 61
  })
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
      email:"hello@lechatfume.fr"
    }
  }),
  organization: 'le-chat-fume',
  deleted_user: 0,
  actions_counter: 1
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
