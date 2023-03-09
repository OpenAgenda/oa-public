'use strict';

const spreadByMLTBoostScores = require('../utils/spreadByMLTBoostScores');
const getMLTDSLPart = require('../utils/getMLTDSLPart');

const fxBoostFormSchema = require('./fixtures/mlt/boost.0.formSchema.json');
const fxBoostBoost = require('./fixtures/mlt/boost.0.boost.json');
const fxBoostDSL = require('./fixtures/mlt/boost.0.cleanDSL.json');
const fxMLT = require('./fixtures/mlt/0.mlt.json');

describe('event-search - unit: mlt utils', () => {
  describe('getMLTDSLPart - fixes', () => {
    it('single values are passed as array in DSL', () => {
      const DSL = getMLTDSLPart({
        'type-devenement': '38',
      }, { formSchema: fxBoostFormSchema });

      expect(DSL).toEqual({
        fields: ['_search_additional_keywords'],
        min_word_length: 3,
        min_term_freq: 1,
        min_doc_freq: 1,
        like: ['9661.38'],
      });
    });

    it('like of keyword-type field includes schema id in values', () => {
      const DSL = getMLTDSLPart({
        'publics-cibles': ['26', '28'],
      }, { formSchema: fxBoostFormSchema });

      expect(DSL).toEqual({
        fields: ['_search_additional_keywords'],
        min_word_length: 3,
        min_term_freq: 1,
        min_doc_freq: 1,
        like: ['9661.26', '9661.28'],
      });
    });
  });

  describe('spreadByMLTBoostScores', () => {
    it('fix - spread is only applied for specified values', () => {
      const DSL = spreadByMLTBoostScores(fxBoostDSL, fxMLT, fxBoostBoost, {
        formSchema: fxBoostFormSchema,
      });

      expect(DSL.query.dis_max.queries.filter(q => q === null).length).toBe(0);
    });

    it(
      'fix - additional optionable fields fall in the _search_additional_keywords field',
      () => {
        const DSL = spreadByMLTBoostScores(fxBoostDSL, fxMLT, fxBoostBoost, {
          formSchema: fxBoostFormSchema,
        });

        expect(
          DSL.query.dis_max.queries[0].bool.must[0].more_like_this.fields[0],
        ).toEqual('_search_additional_keywords');
      },
    );
  });
});
