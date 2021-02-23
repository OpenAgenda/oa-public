'use strict';

require("core-js/modules/es.string.link.js");

var validators = {
  list: require('@openagenda/validators/list'),
  link: require('@openagenda/validators/link'),
  phone: require('@openagenda/validators/phone'),
  email: require('@openagenda/validators/email')
};

module.exports = function (_ref) {
  var field = _ref.field;
  return validators.list({
    field: field,
    types: ['link', 'phone', 'email'],
    validators: {
      link: validators.link,
      phone: validators.phone,
      email: validators.email
    }
  });
};
//# sourceMappingURL=registration.js.map