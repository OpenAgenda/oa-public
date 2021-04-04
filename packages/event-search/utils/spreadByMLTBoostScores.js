'use strict';

const _ = require('lodash');
const { produce } = require('immer');

const getMLTDSLPart = require('./getMLTDSLPart');
const isIntegerLike = value => !isNaN(parseInt(value));

module.exports = produce((DSL, MLTRequest, scores, options) => {
  DSL.query = {
    dis_max: {
      queries: Object.keys(scores).map(scoredField => {
        const fieldValue = _.get(MLTRequest, scoredField);
        const boostedField = isIntegerLike(fieldValue)
          ? '_search_additional_keywords'
          : scoredField;
        
        if ([undefined, null].includes(fieldValue)) {
          return null;
        }

        return produce(DSL.query, query => {
          query.bool.must = (DSL.query.bool.must || []).concat({
            more_like_this: {
              ...getMLTDSLPart(_.set({}, scoredField, fieldValue), options),
              boost: scores[scoredField],
              fields: [boostedField]
            }
          });
        });

      }).filter(q => !!q)
    }
  }
});