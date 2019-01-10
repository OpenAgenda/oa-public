"use strict";

const { promisify } = require( 'util' );

module.exports = redis => ( {
  set: promisify( redis.set ).bind( redis ),
  get: promisify( redis.get ).bind( redis )
} );
