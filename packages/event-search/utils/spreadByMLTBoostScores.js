'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const getMLTDSLPart = require('./getMLTDSLPart');

module.exports = (DSL, MLTRequest, scores, options) => ih(DSL, {
  query: {
    $set: {
      dis_max: {
        queries: Object.keys(scores).map(scoredField => {
          const fieldValue = _.get(MLTRequest, scoredField);
          const boostedField = _isIntegerLike(fieldValue)
            ? '_search_additional_keywords'
            : scoredField;

          if ([undefined, null].includes(fieldValue)) {
            return null;
          }

          return ih(DSL.query, {
            bool: {
              must: {
                $set: (DSL.query.bool.must || []).concat({
                  more_like_this: {
                    ...getMLTDSLPart(_.set({}, scoredField, fieldValue), options),
                    boost: scores[scoredField],
                    fields: [boostedField]
                  }
                })
              }
            }
          });
        }).filter(q => !!q)
      }
    }
  }
});


function _isIntegerLike(value) {
  return !isNaN(parseInt(value));
}
