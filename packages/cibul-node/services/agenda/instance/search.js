'use strict';

module.exports = require( '../../lib/instanceLoader' )( () => ({
  searchStream: () => { throw new Error('legacy searchStream is no longer available'); },
  resync: () => { throw new Error('resync of legacy search is no longer available'); },
  search: () => { throw new Error('legacy search is no longer available'); },
  aggregate: () => { throw new Error('legacy aggregate search is no longer available'); },
}));
