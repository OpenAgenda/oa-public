"use strict";

const should = require( 'should' );

const parseTagSet = require( '../server/legacy/parseTagSet' );

describe( 'form-schemas -09- unit (server): legacy tag sets', function() {

  it( 'takes a form schema, a tag set and returns a form schema with the tag set groups added as fields', () => {

    const tagSet = {
      "groups": [ {
        "name": "Niveau scolaire",
        "tags": [
          {
            "id": 10124,
            "label": "Niveau scolaire: Ecole",
            "slug": "ecole"
          },
          {
            "id": 10125,
            "label": "Niveau scolaire: Collège",
            "slug": "college"
          },
          {
            "id": 10126,
            "label": "Niveau scolaire: Lycée",
            "slug": "lycee"
          },
          {
            "id": 10127,
            "label": "Niveau scolaire: Autre",
            "slug": "autre"
          }
        ],
        "required": true,
        "unique": false
      }, {
        "name": "Style musical",
        "tags": [
          {
            "id": 10128,
            "label": "Style musical : A cappella",
            "slug": "a-cappella"
          },
          {
            "id": 10129,
            "label": "Style musical : Afrique",
            "slug": "afrique"
          },
          {
            "id": 10130,
            "label": "Style musical : Baroque",
            "slug": "baroque"
          }
        ],
        "required": false,
        "unique": true
      } ]
    }

    parseTagSet( { fields: [] }, tagSet ).should.eql( {
      nextOptionId: 8,
      "defaultLabelLanguage": null,
      fields: [
        {
          field: 'niveau-scolaire',
          label: {
            fr: 'Niveau scolaire'
          },
          info: null,
          sub : null,
          help: null,
          helpLink: null,
          write: null,
          read: null,
          optional: false,
          display: true,
          min: null,
          max: null,
          options: [ {
            id: 1,
            value: 'ecole',
            label: {
              fr: 'Niveau scolaire: Ecole'
            },
            legacyId: 10124
          },
          {
            id: 2,
            value: 'college',
            label: {
              fr: 'Niveau scolaire: Collège'
            },
            legacyId: 10125
          },
          {
            "id": 3,
            "value": "lycee",
            "label": {
              "fr": "Niveau scolaire: Lycée"
            },
            legacyId: 10126
          },
          {
            "id": 4,
            "value": "autre",
            "label": {
              "fr": "Niveau scolaire: Autre"
            },
            legacyId: 10127
          } ],
          fieldType: "checkbox",
          "placeholder" : null,
          "origin" : "tags",
          enableWith : null,
          related: [],
          default: null
        },
        {
          field: "style-musical",
          label: {
            "fr": "Style musical"
          },
          info: null,
          placeholder : null,
          sub : null,
          help: null,
          helpLink: null,
          write: null,
          read: null,
          "optional": true,
          display: true,
          "options": [
            {
              "id": 5,
              "value": "a-cappella",
              "label": {
                "fr": "Style musical : A cappella"
              },
              legacyId: 10128
            },
            {
              "id": 6,
              "value": "afrique",
              "label": {
                "fr": "Style musical : Afrique"
              },
              legacyId: 10129
            },
            {
              "id": 7,
              "value": "baroque",
              "label": {
                "fr": "Style musical : Baroque"
              },
              legacyId: 10130
            }
          ],
          "fieldType": "radio",
          "origin" : "tags",
          enableWith : null,
          related: [],
          default: null
        }
      ],
      custom: null
    } );

  } );


  it( 'takes a form schema, a category set and returns a form schema with the category set added as fields', () => {

    parseTagSet.categories( { fields: [] }, {
      "name": "Type d'animation",
      "info": "Si vous souhaitez être plus précis, vosu pouvez également ajouter des mots-clés dans le formulaire.",
      "categories": [ {
        "id": 3028,
        "label": "Atelier",
        "slug": "atelier"
      },
      {
        "id": 3029,
        "label": "Exposition",
        "slug": "exposition"
      },
      {
        "id": 3030,
        "label": "Jeu",
        "slug": "jeu"
      } ],
      "required": true
    } ).should.eql( {
      "nextOptionId": 4,
      "custom" : null,
      "defaultLabelLanguage": null,
      "fields": [ {
        "field": "type-danimation",
        "label": {
          "fr": "Type d'animation"
        },
        "info": {
          "fr": "Si vous souhaitez être plus précis, vosu pouvez également ajouter des mots-clés dans le formulaire."
        },
        "placeholder" : null,
        "write": null,
        "read": null,
        "optional": false,
        display: true,
        "options": [
          {
            "id": 1,
            "value": "atelier",
            "label": {
              "fr": "Atelier"
            },
            "legacyId" : 3028
          },
          {
            "id": 2,
            "value": "exposition",
            "label": {
              "fr": "Exposition"
            },
            "legacyId" : 3029
          },
          {
            "id": 3,
            "value": "jeu",
            "label": {
              "fr": "Jeu"
            },
            "legacyId" : 3030
          }
        ],
        "fieldType": "radio",
        "origin" : "categories",
        sub : null,
        help: null,
        helpLink: null,
        enableWith : null,
        default: null,
        related: []
      } ]
    } );

  } );

} );


