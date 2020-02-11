'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  regex: require('@openagenda/validators/regex')
});

module.exports = nav => {
  const clean = navValidator(nav);

  return clean.scroll ? {
    scroll: clean.scroll,
    size: clean.size
  } : {
    from: clean.from,
    size: clean.size
  }
}

const navValidator = schema({
  scroll: {
    type: 'regex',
    optional: true,
    regex: /^[0-9]([0-9]|)m$/
  },
  from: {
    type: 'integer',
    optional: true,
    default: 0
  },
  size: {
    type: 'integer',
    optional: true,
    default: 20
  }
});
