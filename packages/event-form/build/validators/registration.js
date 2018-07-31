"use strict";

var validators = {
  list: require('@openagenda/validators/list'),
  link: require('@openagenda/validators/link'),
  phone: require('@openagenda/validators/phone'),
  email: require('@openagenda/validators/email')
};

module.exports = function (config) {
  return validators.list({
    field: config.field,
    types: ['link', 'phone', 'email'],
    validators: {
      link: validators.link,
      phone: validators.phone,
      email: validators.email
    }
  });
};
//# sourceMappingURL=registration.js.map