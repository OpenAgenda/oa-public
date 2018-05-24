"use strict";

const remove = require( './remove' );

module.exports = ( userUid, cb ) => remove( userUid, {}, cb );