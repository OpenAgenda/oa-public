const listValidator = require('@openagenda/validators/list');
const linkValidator = require('@openagenda/validators/link');
const phoneValidator = require('@openagenda/validators/phone');
const emailValidator = require('@openagenda/validators/email');

const validators = {
  list: listValidator,
  link: linkValidator,
  phone: phoneValidator,
  email: emailValidator,
};

const flatten = (values = []) => values.map(v => (v && v instanceof Object ? v.value : v));

module.exports = config => {
  const validate = validators.list({
    field: config.field,
    types: ['link', 'phone', 'email'],
    validators: {
      link: validators.link,
      phone: validators.phone,
      email: validators.email,
    },
  });

  return v => validate(v !== null ? flatten(v) : v);
};
