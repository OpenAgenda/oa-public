import _ from 'lodash';
import { produce } from 'immer';
import getMLTDSLPart from './getMLTDSLPart.js';

const isIntegerLike = (value) => !Number.isNaN(parseInt(value, 10));

export default produce((DSL, MLTRequest, scores, options) => {
  DSL.query = {
    dis_max: {
      queries: Object.keys(scores)
        .map((scoredField) => {
          const fieldValue = _.get(MLTRequest, scoredField);
          const boostedField = isIntegerLike(fieldValue)
            ? '_search_additional_keywords'
            : scoredField;

          if ([undefined, null].includes(fieldValue)) {
            return null;
          }

          return produce(DSL.query, (query) => {
            query.bool.must = (DSL.query.bool.must || []).concat({
              more_like_this: {
                ...getMLTDSLPart(_.set({}, scoredField, fieldValue), options),
                boost: scores[scoredField],
                fields: [boostedField],
              },
            });
          });
        })
        .filter((q) => !!q),
    },
  };
});
