'use strict';

const should = require('should');

const spreadByMLTBoostScores = require('../utils/spreadByMLTBoostScores');
const getMLTDSLPart = require('../utils/getMLTDSLPart');

const fx = {
  boost: [{
    mlt: require('./fixtures/mlt/boost.0.mlt.json'),
    boost: require('./fixtures/mlt/boost.0.boost.json'),
    formSchema: require('./fixtures/mlt/boost.0.formSchema.json'),
    cleanDSL: require('./fixtures/mlt/boost.0.cleanDSL.json')
  }],
  mlt: [
    require('./fixtures/mlt/0.mlt.json')
  ]
};

describe('event-search - unit: mlt utils', function() {

  describe('getMLTDSLPart - fixes', () => {

    it('single values are passed as array in DSL', () => {
      const DSL = getMLTDSLPart({
        "type-devenement": "38"
      }, { formSchema: fx.boost[0].formSchema });

      DSL.should.eql({
        fields: [ '_search_additional_keywords' ],
        min_word_length: 3,
        min_term_freq: 1,
        min_doc_freq: 1,
        like: ['9661.38']
      });
    });

    it('like of keyword-type field includes schema id in values', () => {
      const DSL = getMLTDSLPart({
        'publics-cibles': [ '26', '28' ]
      }, { formSchema: fx.boost[0].formSchema });

      DSL.should.eql({
        fields: [ '_search_additional_keywords' ],
        min_word_length: 3,
        min_term_freq: 1,
        min_doc_freq: 1,
        like: [ '9661.26', '9661.28' ]
      });
    });

  });

  describe('spreadByMLTBoostScores', () => {

    it('fix - spread is only applied for specified values', () => {
      const DSL = spreadByMLTBoostScores(fx.boost[0].cleanDSL, fx.mlt[0], fx.boost[0].boost, {
        formSchema: fx.boost[0].formSchema
      });

      DSL.query.dis_max.queries.filter(q => q === null).length.should.equal(0);
    });

    it('fix - additional optionable fields fall in the _search_additional_keywords field', () => {
      const DSL = spreadByMLTBoostScores(fx.boost[0].cleanDSL, fx.mlt[0], fx.boost[0].boost, {
        formSchema: fx.boost[0].formSchema
      });

      DSL.query.dis_max.queries[0].bool.must[0].more_like_this.fields[0].should.equal('_search_additional_keywords');
    });

  });

});
