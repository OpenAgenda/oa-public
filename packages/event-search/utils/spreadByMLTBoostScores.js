'use strict';

const ih = require('immutability-helper');

const getMLTDSLPart = require('./getMLTDSLPart');

module.exports = (DSL, MLTRequest, scores) => ih(DSL, {
  query: {
    $set: {
      dis_max: {
        queries: Object.keys(scores).map(scoredField => {
          const fieldValue = MLTRequest[scoredField];
          const boostedField = _isIntegerLike(fieldValue)
            ? '_search_keywords'
            : scoredField;

          if ([undefined, null].includes(fieldValue)) {
            return null;
          }

          return ih(DSL.query, {
            bool: {
              must: {
                $set: (DSL.query.bool.must || []).concat({
                  more_like_this: {
                    ...getMLTDSLPart({[scoredField]: fieldValue }),
                    boost: scores[scoredField],
                    fields: [boostedField]
                  }
                })
              }
            }
          });
        })
      }
    }
  }
});


function _isIntegerLike(value) {
  return !isNaN(parseInt(value));
}
