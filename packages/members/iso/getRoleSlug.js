import roleValues from './roleValues.js';
import toRoleCode from './toRoleCode.js';

export default (input, options = {}) => {
  const { throwIfUnknown, default: defaultValue } = {
    throwIfUnknown: true,
    default: null,
    ...options,
  };

  const code = toRoleCode(input);
  const role = roleValues.find((v) => v.code === code);
  const slug = role && role.slugs && role.slugs[0];

  if (!slug && throwIfUnknown) {
    throw new Error('Unknown role');
  } else if (!slug) {
    return defaultValue;
  }

  return slug;
};
