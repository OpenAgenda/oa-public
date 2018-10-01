'use strict';

const abilities = require( './' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_abilities',
    password: 'grut',
    user: 'root'
  },
  schemas: {
    rule: 'rule'
  },
  interfaces: {
    defineFor: {
      async user( identifier, { can, cannot, rules } ) {
        /* rules already contains the default rules */

        can( 'create', 'event' );
        can( 'receive', 'activity' );
        cannot( 'receive', 'activity', { verb: 'spam' } );

        /* Define default rules for a user */
        // if ( isAdmin( identifier ) {
        //   can( ... );
        // } else {
        //   cannot( ... );
        // }

        return rules.concat( await abilities.rules.list( 'user', identifier ) );
      },
      async member( identifier, { can, cannot, rules } ) {
        //
      }
    },
    getParents: {
      user() {
        return [
          { entity_name: 'member', identifier: 12345 },
          { entity_name: 'member', identifier: 23456 }
        ];
      }
    }
  }
};
