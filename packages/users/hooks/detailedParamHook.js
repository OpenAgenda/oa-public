import _ from 'lodash';
import _fields from '../service/fields.js';

export default function detailedParamHook() {
  return (context) => {
    context.params.query = context.params.query || {};

    if (context.params.internal !== true) {
      const fields = context.params.detailed
        ? [..._fields.basic, ..._fields.detailed]
        : _fields.basic;
      const select = fields.map(_.snakeCase);
      // `canCreateSecretKeys` is derived from `store.enable_secret` by
      // deriveCanCreateSecretKeys(); pull the raw column even though it
      // isn't a whitelisted field — keepFields() will strip it after
      // derivation.
      if (context.params.detailed && !select.includes('store')) {
        select.push('store');
      }
      context.params.query.$select = select;
    }

    return context;
  };
}
