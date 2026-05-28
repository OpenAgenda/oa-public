import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

// Surfaces `store.enable_secret` as the top-level boolean
// `canCreateSecretKeys` (admin gate on `POST /users/me/api-keys` with
// `oaKind: 'sk'`). The hook may be reinvoked on the same `context.result`
// after `keepFields()` has stripped `store`; the idempotency guard
// preserves the value computed on the first pass.
export default function deriveCanCreateSecretKeys() {
  return (context) => {
    if (context.result === null) {
      return context;
    }

    return alterItems((record) => {
      if ('canCreateSecretKeys' in record) {
        return record;
      }
      const raw = record.store;
      const parsed = _.isString(raw) ? JSON.parse(raw || '{}') : raw;
      record.canCreateSecretKeys = !!parsed?.enable_secret;
      return record;
    })(context);
  };
}
