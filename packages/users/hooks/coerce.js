'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const { alterItems } = require('feathers-hooks-common');
// const fields = require( '../service/fields' );

module.exports = function validate(_schema) {
  return context => {
    const _coerce = schema(
      _schema
      // !context.params.detailed
      //   ? _.pick( _schema, fields.basic )
      //   : _schema
    );

    return alterItems(rec => Object.assign(rec, _.pick(_coerce(rec), Object.keys(rec))))(context);
  };
};
