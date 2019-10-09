'use strict';

const validators = {
  link: require( '@openagenda/validators/link' )(),
  phone: require( '@openagenda/validators/phone' )(),
  email: require( '@openagenda/validators/email' )()
};

module.exports = (registration = []) => Object.keys(validators)
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
}
