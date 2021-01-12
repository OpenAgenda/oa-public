'use strict';

const linkValidator = require('@openagenda/validators/link');
const phoneValidator = require('@openagenda/validators/phone');
const emailValidator = require('@openagenda/validators/email');

const validators = {
  link: linkValidator(),
  phone: phoneValidator(),
  email: emailValidator()
};

const getType = value => {
  for (const rType of Object.keys(validators)) {
    try {
      validators[rType](value);
      return rType;
    } catch (e) {};
  }
};

const getOrder = (registrationWithType = [], o = ['link', 'email', 'phone']) => registrationWithType.sort((r1, r2) => (o.indexOf(r1.type) > o.indexOf(r2.type) ? 1 : -1));

const appendPrefix = ({ value, type }) => {
  if (type === 'email') {
    return {
      type,
      value: `mailto:${value}`
    };
  }
  if (type === 'phone') {
    return {
      type,
      value: `tel:${value}`
    };
  }
  if (type === 'link' && !value.match(/^((http(|s)\:)|)\/\//)) {
    return {
      type,
      value: `https://${value}`
    };
  }
  return {
    type,
    value
  };
};

module.exports = (registration = [], options = {}) => {
  const {
    includeLinkPrefix,
    order,
    useTypeKeys
  } = {
    includeLinkPrefix: false,
    order: null,
    useTypeKeys: false,
    ...options
  };

  let formatted = (registration || [])
    .map(value => ({
      type: getType(value),
      value
    }))
    .filter(v => !!v.type)
    .map(v => (includeLinkPrefix ? appendPrefix(v) : v));

  if (order) {
    formatted = getOrder(formatted, order);
  }

  return useTypeKeys ? formatted.reduce((byKeys, {type, value}) => ({
    ...byKeys,
    [type]: byKeys[type].concat(value)
  }), Object.keys(validators).reduce((init, key) => ({
    ...init,
    [key]: []
  }), {})) : formatted.map(f => f.value);
};
