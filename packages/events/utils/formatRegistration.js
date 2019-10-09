'use strict';

const validators = {
  link: require( '@openagenda/validators/link' )(),
  phone: require( '@openagenda/validators/phone' )(),
  email: require( '@openagenda/validators/email' )()
};

module.exports = (registration = [], options = {}) => {
  const {
    includeLinkPrefix,
    order,
    useTypeKeys
  } = Object.assign({
    includeLinkPrefix: false,
    order: null,
    useTypeKeys: false
  }, options);

  let formatted = (registration || [])
    .map(value => ({
      type: _getType(value),
      value
    }))
    .filter(v => !!v.type)
    .map(v => includeLinkPrefix ? _appendPrefix(v) : v);

  if (order) {
    formatted = _order(formatted, order);
  }

  return useTypeKeys ? formatted.reduce((byKeys, {type, value}) => ({
    ...byKeys,
    [type]: byKeys[type].concat(value)
  }), Object.keys(validators).reduce((init, key) => ({
    ...init,
    [key]: []
  }), {})) : formatted.map(f => f.value);
}

function _appendPrefix({ value, type }) {
  let prefix = '';
  if (type === 'email') {
    prefix = 'mailto:';
  } else if (type === 'phone') {
    prefix = 'tel:';
  } else if (type === 'link' && !value.match(/^((http(|s)\:)|)\/\//)) {
    prefix = 'https://';
  }
  return {
    type,
    value: prefix + value
  };
}

function _order(registrationWithType = [], order = ['link', 'email', 'phone']) {
  return registrationWithType.sort((r1, r2) => order.indexOf(r1.type) > order.indexOf(r2.type) ? 1 : -1);
}

function _getType(value) {
  for (const rType of Object.keys(validators)) {
    try {
      validators[rType](value);
      return rType;
    } catch (e) {}
  }
  return;
}


/*function distributePerType(registration = []) => Object.keys(validators)
  .reduce((byType, type) => ({
    ...byType,
    [type]: (registration || []).filter(_is.bind(null, type))
  }), {});


function _is(type, value) {
  try {
    validators[type](value);
  } catch (e) {
    return false;
  }
  return true;
}*/
