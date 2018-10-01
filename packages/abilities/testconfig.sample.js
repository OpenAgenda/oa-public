'use strict';

const abilities = require( './' );

const getEntity = {
  agenda: uid => ( { uid } ),
  member: id => ( { id } ),
  user: uid => ( { uid } )
};

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
    getEntity,
    defaultFor: {
      user( { can, cannot, rules } ) {
        can( 'create', 'event' );
        can( 'receive', 'activity' );
        cannot( 'receive', 'activity', { verb: 'spam' } );

        return rules;
      }
    },
    defineFor: {
      // agenda = agenda
      // member = agenda + user + member
      // user = agendas + user + members

      async agenda( agenda, builder ) {
        const { rules } = builder;

        return rules.concat( await abilities.rules.list( 'agenda', agenda.uid ) );
      },
      async member( member, builder, options = {} ) {
        const { specificOnly } = options;
        const { rules } = builder;

        const memberRules = await abilities.rules.list( 'member', member.id );

        if ( specificOnly ) {
          return rules.concat( memberRules );
        }

        const defaultRules = {
          agenda: abilities.rules.getDefaultFor( 'agenda' ),
          user: abilities.rules.getDefaultFor( 'user' ),
          member: abilities.rules.getDefaultFor( 'member' )
        };

        const agendaRules = await abilities.get( 'agenda', member.agendaUid ).rules;
        const userRules = await abilities.get( 'user', member.userUid, { specificOnly: true } ).rules;

        return defaultRules.agenda
          .concat( agendaRules )
          .concat( defaultRules.user )
          .concat( userRules )
          .concat( defaultRules.member )
          .concat( rules ) // the rules defined with can/cannot in this block
          .concat( memberRules );
      },
      async user( user, builder, options = {} ) {
        const { specificOnly } = options;
        const { rules } = builder;

        const userRules = await abilities.rules.list( 'user', user.uid );

        // if ( isAdmin( user ) {
        //   can( ... );
        // } else {
        //   cannot( ... );
        // }

        if ( specificOnly ) {
          return rules.concat( userRules );
        }

        const defaultRules = {
          agenda: abilities.rules.getDefaultFor( 'agenda' ),
          user: abilities.rules.getDefaultFor( 'user' ),
          member: abilities.rules.getDefaultFor( 'member' )
        };

        const members = await membersSvc.list( {} );
        const agendas = await agendasSvc.list( {} );

        const agendasRules = await abilities.rules.list( 'agenda', _.map( agendas, 'uid' ) );
        const membersRules = await abilities.rules.list( 'member', _.map( members, 'id' ) );

        // TODO define agendasRules & membersRules

        return defaultRules.user.concat( rules ).concat( userRules );

        return defaultRules.agenda
          .concat( agendasRules )
          .concat( defaultRules.user )
          .concat( rules ) // the rules defined with can/cannot in this block
          .concat( userRules )
          .concat( defaultRules.member )
          .concat( membersRules );
      }
    }
  }
};
