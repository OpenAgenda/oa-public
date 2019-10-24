"use strict";

const should = require('should');

const generateCategorySet = require('../lib/utils/generateCategorySet');

describe('04 - utils - generateCategorySet', () => {

  it('transforms a radio field into a category set', () => {
    generateCategorySet({
      fields: [{
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'radio',
        schemaId: 1,
        origin: 'categories',
        options: [{
          id: 1,
          value: 'un',
          label: 'Un'
        }]
      }]
    }).set.categories.length.should.equal(1);
  });

  it('does not consider field if origin is set to another value than "categories"', () => {
    should(generateCategorySet({
      fields: [{
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'radio',
        schemaId: 1,
        origin: 'custom',
        options: [{
          id: 1,
          value: 'un',
          lable: 'Un'
        }]
      }]
    }).set).equal(null);
  });

  it('a pre-existing category is completed with a schemaOptionId key', () => {
    const schema = {
      fields: [{
        field: 'nantes',
        label: { fr: 'Nantes', en: 'Nantes' },
        fieldType: 'radio',
        schemaId: 1,
        origin: 'categories',
        options: [{
          id: 1,
          value: 'un',
          label: 'Un'
        }]
      }]
    };

    const categorySet = {
      name: 'Nantes',
      categories: [ {
        id: 1,
        value: 'un',
        label: 'Un'
      } ]
    };

    generateCategorySet(schema, categorySet).set
      .categories[0].schemaOptionId.should.equal('1.1');
  });

  it('a schemaOptionId is used for category match if set', () => {
    const schema = {
      fields: [{
        field: 'nantes',
        label: { fr: 'Nantes', en: 'Nantes' },
        fieldType: 'radio',
        schemaId: 1,
        origin: 'categories',
        options: [{
          id: 1,
          value: 'un',
          label: 'Un'
        }]
      }]
    };

    const categorySet = {
      name: 'Nantes',
      categories: [{
        id: 123,
        schemaOptionId: '1.1',
        value: 'douze',
        label: 'Douze'
      }]
    };

    generateCategorySet(schema, categorySet).set
      .categories[0].id.should.equal(123);
  });

  it('updates pre-existing category set', () => {
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
        origin: 'categories',
        field: 'paris',
        label: 'Paris',
        fieldType: 'radio',
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

    const categorySet = {
      name: 'Paris',
      required: true,
      unique: false,
      categories: [ {
        slug: 'trois',
        label: 'Trois',
        id: 192018
      }, {
        label: 'Cinq',
        slug: 'cinq'
      } ]
    };

    generateCategorySet(schema, categorySet).set.should.eql({
      "name": "Paris",
      "required": true,
      "categories": [{
        "label": "Trois",
        "slug": "trois",
        "id": 192018, // maintain those, its important
        "schemaOptionId": "1.3" // add those
      }, {
        "slug": "quatre",
        "label": "Quatre",
        "schemaOptionId": "1.4"
      }]
    });

  });


  it('takes a form schema and returns a matching category set', () => {

    const schema = {
      nextOptionId: 8,
      "defaultLabelLanguage": null,
      fields: [{
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
        "options": [{
          "id": 5,
          "value": "a-cappella",
          "label": {
            "fr": "Style musical : A cappella"
          }
        }, {
          "id": 6,
          "value": "afrique",
          "label": {
            "fr": "Style musical : Afrique"
          }
        }, {
          "id": 7,
          "value": "baroque",
          "label": {
            "fr": "Style musical : Baroque"
          }
        }],
        "fieldType": "radio",
        "origin" : "categories",
        enableWith : null,
        related: [],
        default: null
      }],
      custom: null
    };

    generateCategorySet(schema).set.should.eql({
      "name": "Style musical",
      "categories": [{
        "label": "Style musical : A cappella",
        "slug": "a-cappella",
        "schemaOptionId" : "1.5"
      }, {
        "label": "Style musical : Afrique",
        "slug": "afrique",
        "schemaOptionId" : "1.6"
      }, {
        "label": "Style musical : Baroque",
        "slug": "baroque",
        "schemaOptionId" : "1.7"
      }],
      "required": false
    });

  } );

} );


