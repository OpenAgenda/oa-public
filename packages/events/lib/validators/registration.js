'use strict';

const validators = {
  list: require('@openagenda/validators/list'),
  link: require('@openagenda/validators/link'),
  phone: require('@openagenda/validators/phone'),
  email: require('@openagenda/validators/email')
}

module.exports = ({ field }) => validators.list({
  field,
  types: ['link', 'phone', 'email'],
  validators: {
    link: validators.link,
    phone: validators.phone,
    email: validators.email
  }
});
