"use strict";

const { promisify } = require( 'util' );

module.exports = redis => ( {
  set: promisify( redis.set ).bind( redis ),
  get: promisify( redis.get ).bind( redis ),
  blpop: promisify( redis.blpop ).bind( redis ),
  rpush: promisify( redis.rpush ).bind( redis ),
  del: promisify( redis.del ).bind( redis ),
  duplicate: redis.duplicate.bind( redis )
} );
