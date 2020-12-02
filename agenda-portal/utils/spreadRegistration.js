'use strict';

module.exports = (registration, options = {}) => {
  const keys = options.keys || {
    email: 'registrationEmails',
    phone: 'registrationPhones',
    link: 'registrationLinks'
  };

  return (registration || []).reduce(
    (obj, { type, value }) => ({
      ...obj,
      [keys[type]]: obj[keys[type]].concat(value)
    }),
    Object.values(keys).reduce(
      (obj, value) => ({
        ...obj,
        [value]: []
      }),
      {}
    )
  );
};
