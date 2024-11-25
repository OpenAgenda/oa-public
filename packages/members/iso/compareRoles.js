import getRoleSlug from './getRoleSlug.js';

const roleWeights = {
  administrator: 100,
  moderator: 50,
  contributor: 10,
  reader: 1,
  norole: 0,
};

function isEqualTo(role, compareWithRole) {
  return (
    getRoleSlug(role, {
      default: 'norole',
      throwIfUnknown: false,
    })
    === getRoleSlug(compareWithRole, {
      default: 'norole',
      throwIfUnknown: false,
    })
  );
}

function isSuperiorTo(role, compareWithRole) {
  return (
    roleWeights[
      getRoleSlug(role, {
        default: 'norole',
        throwIfUnknown: false,
      })
    ]
    > roleWeights[
      getRoleSlug(compareWithRole, {
        default: 'norole',
        throwIfUnknown: false,
      })
    ]
  );
}

function isSuperiorToOrEqual(role, compareWithRole) {
  return (
    isSuperiorTo(role, compareWithRole) || isEqualTo(role, compareWithRole)
  );
}

function isLessThan(role, compareWithRole) {
  return (
    roleWeights[
      getRoleSlug(role, {
        default: 'norole',
        throwIfUnknown: false,
      })
    ]
    < roleWeights[
      getRoleSlug(compareWithRole, {
        default: 'norole',
        throwIfUnknown: false,
      })
    ]
  );
}

export {
  isSuperiorTo,
  isSuperiorToOrEqual,
  isEqualTo,
  isLessThan,
  isLessThan as isInferiorTo,
};
