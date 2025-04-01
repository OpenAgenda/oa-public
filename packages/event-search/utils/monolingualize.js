import _ from 'lodash';
import { produce } from 'immer';

export default (fields, languages, event) => {
  if (!languages?.length) {
    return event;
  }

  return produce(event, (draft) => {
    const candidateFields = fields.filter((f) => _.isObject(_.get(draft, f)));

    for (const field of candidateFields) {
      const language = []
        .concat(languages)
        .filter((l) => _.get(draft, `${field}.${l}`))
        .shift();

      _.set(draft, field, _.get(draft, `${field}.${language}`));
    }
  });
};
