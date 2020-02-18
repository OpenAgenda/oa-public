'use strict';

const ih = require('immutability-helper');

const getMLTDSLPart = require('./getMLTDSLPart');

module.exports = (DSL, MLTRequest, options) => {
  const must = (DSL.query.bool.must || []).concat({
    more_like_this: getMLTDSLPart(MLTRequest, options)
  });

  return ih(DSL, {
    query: {
      bool: {
        must: {
          $set: must
        }
      }
    }
  });
}
