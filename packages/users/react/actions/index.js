"use strict";

const types = require( './actionsTypes' );

module.exports = {
  action: ( status = 'request', data ) => ({ type: types.ACTION, status, data })
};

