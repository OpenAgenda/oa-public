import hooksCommon from 'feathers-hooks-common';
import fields from '../service/fields.js';

const { keep } = hooksCommon;

export default function keepFields() {
  return (context) => {
    if (context.result === null || context.params.internal === true) {
      return context;
    }

    // Fields derived in after-hooks (not stored as columns); kept here
    // so keepFields() doesn't strip them. `canCreateSecretKeys` only
    // exists when `detailed` is set (deriveCanCreateSecretKeys() needs
    // the `store` column, which is only pulled in detailed mode).
    const socialFields = ['hasSocialAccount', 'hasLocalAccount'];
    const detailedDerivedFields = ['canCreateSecretKeys'];

    return keep(
      ...context.params.detailed
        ? [
          ...fields.basic,
          ...fields.detailed,
          ...socialFields,
          ...detailedDerivedFields,
        ]
        : [...fields.basic, ...socialFields],
    )(context);
  };
}
