"use strict";

const should = require( 'should' );

const generateTagSet = require( '../lib/utils/generateTagSet' );

describe( '02 - utils - generateTagSet', () => {

  it( 'transforms a checkbox field into a tag group', () => {

    generateTagSet( {
      fields: [ {
        field: 'nantes',
        origin: 'tags',
        label: 'Nantes',
        fieldType: 'checkbox',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          lable: 'Un'
        } ]
      } ]
    } ).tagSet.groups.length.should.equal( 1 );

  } );

  it( 'transforms a radio field into a tag group', () => {

    generateTagSet( {
      fields: [ {
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          lable: 'Un'
        } ]
      } ]
    } ).tagSet.groups.length.should.equal( 1 );

  } );

  it( 'does not consider field if origin is set to another value than "tags"', () => {

    generateTagSet( {
      fields: [ {
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'radio',
        schemaId: 1,
        origin: 'custom',
        options: [ {
          id: 1,
          value: 'un',
          lable: 'Un'
        } ]
      } ]
    } ).tagSet.groups.length.should.equal( 0 );
  } );

  it( 'matches a field with an existing tag group based on a monolingual label', () => {
    const schema = {
      fields: [ {
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Nantes',
        tags: [ {
          id: 122,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.groups.length.should.equal( 1 );

    generateTagSet( schema, tagSet ).tagSet.groups[ 0 ].name.should.equal( 'Nantes' );

  } );

  it( 'matches a field with an existing tag group based on a multilingual label', () => {

    const schema = {
      fields: [ {
        field: 'nantes',
        origin: 'tags',
        label: { fr: 'Nantes', en: 'Nantes' },
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          lable: 'Un'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Nantes',
        tags: []
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.groups.length.should.equal( 1 );

    generateTagSet( schema, tagSet ).tagSet.groups[ 0 ].name.should.equal( 'Nantes' );

  } );

  it( 'a field with a name matching no group is added', () => {

    const schema = {
      fields: [ {
        field: 'london',
        label: { fr: 'Londres', en: 'London' },
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Nantes',
        tags: []
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.groups.length.should.equal( 1 );

    generateTagSet( schema, tagSet ).tagSet.groups[ 0 ].name.should.equal( 'Londres' );

  } );

  it( 'a pre-existing tag is completed with a schemaOptionId key', () => {

    const schema = {
      fields: [ {
        field: 'nantes',
        label: { fr: 'Nantes', en: 'Nantes' },
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Nantes',
        tags: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.groups[ 0 ].tags[ 0 ].schemaOptionId.should.equal( '1.1' );

  } );

  it( 'a schemaOptionId is used for tag match if set', () => {

    const schema = {
      fields: [ {
        field: 'nantes',
        label: { fr: 'Nantes', en: 'Nantes' },
        fieldType: 'radio',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Nantes',
        tags: [ {
          id: 123,
          schemaOptionId: '1.1',
          value: 'douze',
          label: 'Douze'
        } ]
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.groups[ 0 ].tags[ 0 ].id.should.equal( 123 );

  } );

  it( 'updates pre-existing tag set', () => {

    const schema = {
      fields: [ {
        origin: 'tags',
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'checkbox',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        }, {
          id: 2,
          value: 'deux',
          label: 'Deux'
        } ]
      }, {
        origin: 'tags',
        field: 'paris',
        label: 'Paris',
        fieldType: 'checkbox',
        schemaId: 1,
        options: [ {
          id: 3,
          value: 'trois',
          label: 'Trois'
        }, {
          id: 4,
          value: 'quatre',
          label: 'Quatre'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Paris',
        required: true,
        unique: false,
        tags: [ {
          slug: 'trois',
          label: 'Trois',
          id: 192018
        }, {
          label: 'Cinq',
          slug: 'cinq'
        } ]
      }, {
        name: 'Lyon',
        required: true,
        unique: false,
        tags: [ {
          label: 'Six',
          slug: 'six',
          id: 192019
        } ]
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.should.eql( {
      groups: [ {
        "name": "Nantes",
        "required": true,
        "unique": false,
        "tags": [ {
          "slug": "un",
          "label": "Un",
          "schemaOptionId": "1.1"
        }, {
          "slug": "deux",
          "label": "Deux",
          "schemaOptionId": "1.2"
        } ]
      }, {
        "name": "Paris",
        "required": true,
        "unique": false,
        "tags": [ {
          "label": "Trois",
          "slug": "trois",
          "id": 192018, // maintain those, its important
          "schemaOptionId": "1.3" // add those
        }, {
          "slug": "quatre",
          "label": "Quatre",
          "schemaOptionId": "1.4"
        } ]
      } ]
    } );

  } );


  it( 'takes a form schema and returns a matching tag set', () => {

    const schema = {
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
          write: 'contributor',
          read: null,
          optional: false,
          display: true,
          min: null,
          max: null,
          schemaId: 1,
          options: [ {
            id: 1,
            value: 'ecole',
            label: {
              fr: 'Niveau scolaire: Ecole'
            }
          },
          {
            id: 2,
            value: 'college',
            label: {
              fr: 'Niveau scolaire: Collège'
            }
          },
          {
            "id": 3,
            "value": "lycee",
            "label": {
              "fr": "Niveau scolaire: Lycée"
            }
          },
          {
            "id": 4,
            "value": "autre",
            "label": {
              "fr": "Niveau scolaire: Autre"
            }
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
          write: 'contributor',
          read: null,
          "optional": true,
          display: true,
          schemaId: 1,
          "options": [
            {
              "id": 5,
              "value": "a-cappella",
              "label": {
                "fr": "Style musical : A cappella"
              }
            },
            {
              "id": 6,
              "value": "afrique",
              "label": {
                "fr": "Style musical : Afrique"
              }
            },
            {
              "id": 7,
              "value": "baroque",
              "label": {
                "fr": "Style musical : Baroque"
              }
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
    };

    generateTagSet( schema ).tagSet.should.eql( {
      "groups": [ {
        "name": "Niveau scolaire",
        "tags": [
          {
            "label": "Niveau scolaire: Ecole",
            "slug": "ecole",
            "schemaOptionId" : "1.1"
          },
          {
            "label": "Niveau scolaire: Collège",
            "slug": "college",
            "schemaOptionId" : "1.2"
          },
          {
            "label": "Niveau scolaire: Lycée",
            "slug": "lycee",
            "schemaOptionId" : "1.3"
          },
          {
            "label": "Niveau scolaire: Autre",
            "slug": "autre",
            "schemaOptionId" : "1.4"
          }
        ],
        "required": true,
        "unique": false
      }, {
        "name": "Style musical",
        "tags": [
          {
            "label": "Style musical : A cappella",
            "slug": "a-cappella",
            "schemaOptionId" : "1.5"
          },
          {
            "label": "Style musical : Afrique",
            "slug": "afrique",
            "schemaOptionId" : "1.6"
          },
          {
            "label": "Style musical : Baroque",
            "slug": "baroque",
            "schemaOptionId" : "1.7"
          }
        ],
        "required": false,
        "unique": true
      } ]
    } );

  } );

} );


