'use strict';

const should = require('should');
const extractSchemaLabelLanguages = require('../client/src/FormSchemaBuilder/lib/extractSchemaLabelLanguages');

describe('unit - extractSchemaLabelLanguages', () => {

  it('ignores empty labels', () => {
    const languages = extractSchemaLabelLanguages({ fields: [{
      label: {
        fr: 'Un champ',
        en: 'Un autre champ',
        pl: ''
      }
    }, {
      label: {
        fr: 'Oui',
        en: 'Yes'
      }
    }]});

    languages.should.eql(['fr', 'en']);
  });

});
