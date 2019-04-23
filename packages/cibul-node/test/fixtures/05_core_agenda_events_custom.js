"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const raw = [
  'reset.sql',
  'agenda.create.sql',
  'network.create.sql',
  'user.create.sql',
  'formSchema.create.sql',
  'member.create.sql',
  'event.create.sql',
  'custom.create.sql',
  'agendaEvent.create.sql',
  'location.create.sql',
  'legacyEvent.create.sql',
  'legacyEventLocation.create.sql',
  'legacyEventTranslation.create.sql',
  'legacyEventLocationTranslation.create.sql',
  'legacyOccurrence.create.sql',
  'legacyEventEditor.create.sql',
  'legacyAgendaEvent.create.sql',
  'legacyEventReference.create.sql',
  'legacyAgendaEventTag.create.sql',
  'legacyDeleted.create.sql',
  'legacyAgendaCategory.create.sql',
  'legacyAgendaTag.create.sql',
  'legacyTagSet.create.sql'
].map( fx => fs.readFileSync( __dirname + '/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );


raw.push( knex( 'agenda' ).insert( [ {
  id: 13901,
  title: 'Custom fielded agenda',
  slug: 'custom_fielded_agenda',
  owner_id: 1,
  uid: 60934473,
  form_schema_id: 26,
  store: JSON.stringify( `{
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
  }` )
}, {
  id: 13902,
  title: 'Custom fielded agenda with network',
  slug: 'custom_fielded_agenda_with_network',
  owner_id: 1,
  uid: 60935574,
  form_schema_id: 26,
  network_uid: 1,
  store: JSON.stringify( `{
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
  }` )
} ] ) );

raw.push( knex( 'network' ).insert( {
  id: 1,
  uid: 1,
  title: 'My very first network',
  form_schema_id: 27
} ) );

raw.push( knex( 'user' ).insert( {
  id: 1,
  full_name: 'Kevin B.',
  uid: 92
} ) );

raw.push( knex( 'member' ).insert( {
  id: 1,
  user_id: 1,
  review_id: 1,
  credential: 2
} ) );

raw.push( knex( 'location' ).insert( {
  id: 1,
  placename: 'La boutique',
  address: '29 passage du ponceau, Paris',
  latitude: 1,
  longitude: 1,
  uid: 65208887
} ) );

raw.push( knex( 'legacy_agenda_tag' ).insert( [
  {
    id: 27854,
    review_id: 13901,
    tag:"Culture","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"culture"},
  {
    id: 27855,
    review_id: 13901,
    tag:"Toutes","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"toutes"},
  {
    id: 27856,
    review_id: 13901,
    tag:"D\u00e9chets recyclage","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"dechets-recyclage"},
  {
    id: 27857,
    review_id: 13901,
    tag:"Economie - Innovation","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"economie-innovation"},
  {
    id: 27858,
    review_id: 13901,
    tag:"\u00c9ducation","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"education"},
  {
    id: 27859,
    review_id: 13901,
    tag:"International","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"international"},
  {
    id: 27860,
    review_id: 13901,
    tag:"Loisirs","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"loisirs"},
  {
    id: 27861,
    review_id: 13901,
    tag:"Nature - Environnement","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"nature-environnement"},
  {
    id: 27862,
    review_id: 13901,
    tag:"Patrimoine","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"patrimoine"},
  {
    id: 27863,
    review_id: 13901,
    tag:"Sant\u00e9","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"sante"},
  {
    id: 27864,
    review_id: 13901,
    tag:"Solidarit\u00e9","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"solidarite"},
  {
    id: 27865,
    review_id: 13901,
    tag:"Sports","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"sports"},
  {
    id: 27866,
    review_id: 13901,
    tag:"Urbanisme","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"urbanisme"},
  {
    id: 27867,
    review_id: 13901,
    tag:"Transports - D\u00e9placements","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"transports-deplacements"},
  {
    id: 27868,
    review_id: 13901,
    tag:"Tous","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"tous"},
  {
    id: 27869,
    review_id: 13901,
    tag:"Conf\u00e9rence","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"conference"},
  {
    id: 27870,
    review_id: 13901,
    tag:"Congr\u00e8s - Colloque","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"congres-colloque"},
  {
    id: 27871,
    review_id: 13901,
    tag:"Conseil de la m\u00e9tropole","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"conseil-de-la-metropole"},
  {
    id: 27872,
    review_id: 13901,
    tag:"\u00c9v\u00e9nement sportif","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"evenement-sportif"},
  {
    id: 27873,
    review_id: 13901,
    tag:"Exposition","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"exposition"},
  {
    id: 27874,
    review_id: 13901,
    tag:"Foire - Salon","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"foire-salon"},
  {
    id: 27875,
    review_id: 13901,
    tag:"F\u00eate - Festival","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"fete-festival"},
  {
    id: 27876,
    review_id: 13901,
    tag:"R\u00e9union publique","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"reunion-publique"},
  {
    id: 27877,
    review_id: 13901,
    tag:"Stage - Atelier","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"stage-atelier"},
  {
    id: 27878,
    review_id: 13901,
    tag:"Spectacle","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"spectacle"},
  {
    id: 27879,
    review_id: 13901,
    tag:"Tout Public","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"tout-public"},
  {
    id: 27880,
    review_id: 13901,
    tag:"Adulte","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"adulte"},
  {
    id: 27881,
    review_id: 13901,
    tag:"Jeune Public","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"jeune-public"},
  {
    id: 27882,
    review_id: 13901,
    tag:"Personne en situation de handicap","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"personne-en-situation-de-handicap"},
  {
    id: 27883,
    review_id: 13901,
    tag:"Professionnel","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"professionnel"},
  {
    id: 27884,
    review_id: 13901,
    tag:"Collectivit\u00e9","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"collectivite"},
  {
    id: 27885,
    review_id: 13901,
    tag:"Association","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"association"},
  {
    id: 27886,
    review_id: 13901,
    tag:"Partenaire","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"partenaire"},
  {
    id: 27887,
    review_id: 13901,
    tag:"Particulier","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"particulier"},
  {
    id: 27888,
    review_id: 13901,
    tag:"Entr\u00e9e Libre","created_at":"2018-02-26 14:58:47","updated_at":"2018-02-26 14:58:47","slug":"entree-libre"}
] ) );

raw.push( knex( 'tag_set' ).insert( {
  id: 13901,
  store: `{"groups":[{"name":"Thématiques Métropolitaines","info":"","tags":[{"id":27855,"label":"Toutes","slug":"toutes"},{"id":27854,"label":"Culture","slug":"culture"},{"id":27856,"label":"Déchets recyclage","slug":"dechets-recyclage"},{"id":27857,"label":"Economie - Innovation","slug":"economie-innovation"},{"id":27858,"label":"Éducation","slug":"education"},{"id":27859,"label":"International","slug":"international"},{"id":27860,"label":"Loisirs","slug":"loisirs"},{"id":27861,"label":"Nature - Environnement","slug":"nature-environnement"},{"id":27862,"label":"Patrimoine","slug":"patrimoine"},{"id":27863,"label":"Santé","slug":"sante"},{"id":27864,"label":"Solidarité","slug":"solidarite"},{"id":27865,"label":"Sports","slug":"sports"},{"id":27867,"label":"Transports - Déplacements","slug":"transports-deplacements"},{"id":27866,"label":"Urbanisme","slug":"urbanisme"}],"access":"public","required":true,"unique":false},{"name":"Types d'événements","info":"","tags":[{"id":27868,"label":"Tous","slug":"tous"},{"id":27869,"label":"Conférence","slug":"conference"},{"id":27870,"label":"Congrès - Colloque","slug":"congres-colloque"},{"id":27871,"label":"Conseil de la métropole","slug":"conseil-de-la-metropole"},{"id":27872,"label":"Événement sportif","slug":"evenement-sportif"},{"id":27873,"label":"Exposition","slug":"exposition"},{"id":27874,"label":"Foire - Salon","slug":"foire-salon"},{"id":27875,"label":"Fête - Festival","slug":"fete-festival"},{"id":27876,"label":"Réunion publique","slug":"reunion-publique"},{"id":27878,"label":"Spectacle","slug":"spectacle"},{"id":27877,"label":"Stage - Atelier","slug":"stage-atelier"}],"access":"public","required":true,"unique":false},{"name":"Public","info":"","tags":[{"id":27879,"label":"Tout Public","slug":"tout-public"},{"id":27880,"label":"Adulte","slug":"adulte"},{"id":27881,"label":"Jeune Public","slug":"jeune-public"},{"id":27882,"label":"Personne en situation de handicap","slug":"personne-en-situation-de-handicap"},{"id":27883,"label":"Professionnel","slug":"professionnel"}],"access":"public","required":true,"unique":false},{"name":"Organisateur","info":"","tags":[{"id":27884,"label":"Collectivité","slug":"collectivite"},{"id":27885,"label":"Association","slug":"association"},{"id":27886,"label":"Partenaire","slug":"partenaire"},{"id":27887,"label":"Particulier","slug":"particulier"}],"access":"public","required":true,"unique":false},{"name":"","info":"Participation","tags":[{"id":27888,"label":"Entrée Libre","slug":"entree-libre"}],"access":"public","required":false,"unique":true}]}`
} ) );

raw.push( knex( 'form_schema' ).insert( [ {
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
  }`
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
      "write": [ "contributor" ],
      "read": [ "administrator" ],
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
      "write": [ "contributor" ],
      "read": [ "administrator", "moderator" ],
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
}`
} ] ) );

module.exports = raw.join( ';\n' ) + ';';
