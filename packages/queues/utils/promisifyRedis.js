"use strict";

const { promisify } = require( 'util' );

module.exports = redis => ( {
  set: promisify( redis.set ).bind( redis ),
  get: promisify( redis.get ).bind( redis ),
  blpop: promisify( redis.blpop ).bind( redis ),
  lpop: promisify( redis.lpop ).bind( redis ),
  rpush: promisify( redis.rpush ).bind( redis ),
  llen: promisify( redis.llen ).bind( redis ),
  lpush: promisify( redis.lpush ).bind( redis ),
  del: promisify( redis.del ).bind( redis ),
  quit: promisify( redis.quit ).bind( redis ),
  duplicate: redis.duplicate.bind( redis )
} );
