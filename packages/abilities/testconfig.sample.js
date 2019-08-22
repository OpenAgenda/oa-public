'use strict';

const abilities = require('./src/service');

const editableRules = {
  agenda: () => [
    {
      actions: 'receive',
      subject: 'eventCreation'
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: -1 // refused
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 0 // tocontrol
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 1 // controlled
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 2 // published
      }
    },
    {
      actions: 'receive',
      subject: 'eventUpdate'
    },
    {
      actions: 'receive',
      subject: 'eventAggregation'
    }
  ],
  user: () => [
    {
      actions: 'receive',
      subject: 'invitation'
    },
    {
      actions: 'receive',
      subject: 'notificationsSummary'
    },
    {
      actions: 'receive',
      subject: 'event'
    },
    {
      actions: 'receive',
      subject: 'eventCreation'
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: -1 // refused
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 0 // tocontrol
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 1 // controlled
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 2 // published
      }
    },
    {
      actions: 'receive',
      subject: 'eventUpdate'
    },
    {
      actions: 'receive',
      subject: 'eventAggregation'
    }
  ],
  member: () => [
    {
      actions: 'receive',
      subject: 'event'
    },
    {
      actions: 'receive',
      subject: 'eventCreation'
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: -1 // refused
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 0 // tocontrol
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 1 // controlled
      }
    },
    {
      actions: 'receive',
      subject: 'stateChange',
      conditions: {
        state: 2 // published
      }
    },
    {
      actions: 'receive',
      subject: 'eventUpdate'
    },
    {
      actions: 'receive',
      subject: 'eventAggregation'
    }
  ]
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
  entityMapping: {
    agenda: 'uid',
    member: 'id',
    user: 'uid'
  },
  interfaces: {
    getEntity: {
      agenda: uid => ({
        uid,
        title: "Titre de l'agenda"
      }),
      member: id => ({
        // needs agendaTitle
        id,
        agendaUid: 456789,
        agendaTitle: "Titre de l'agenda",
        crendential: 1,
        userUid: 99999999
      }),
      user: uid => ({
        uid,
        fullName: 'Bertho'
      })
    },
    listEntities: {
      agenda: uids => uids.map(uid => ({
        uid,
        title: "Titre de l'agenda"
      })),
      member: ids => ids.map(id => ({
        // needs all agendaTitle
        id,
        agendaUid: 456789,
        agendaTitle: "Titre de l'agenda",
        crendential: 1,
        userUid: 99999999
      })),
      user: uids => uids.map(uid => ({
        uid,
        fullName: 'Bertho'
      }))
    },
    defaultFor: {
      user({ can, cannot, rules }) {
        can('create', 'event');
        can('receive', 'activity');
        cannot('receive', 'activity', { verb: 'spam' });

        return rules;
      }
    },
    defineFor: {
      // agenda = agenda
      // user = user
      // member = agenda + user + member

      async agenda(agenda, builder, options = {}) {
        const defaultRules = abilities.rules.getDefaultFor('agenda');
        const agendaRules = options.rules || (await abilities.rules.list('agenda', agenda.uid));

        return defaultRules
          .concat(builder.rules) // the rules defined with can/cannot in this block
          .concat(agendaRules);
      },
      async user(user, builder, options = {}) {
        const defaultRules = abilities.rules.getDefaultFor('user');
        const userRules = options.rules || (await abilities.rules.list('user', user.uid));

        return defaultRules
          .concat(builder.rules) // the rules defined with can/cannot in this block
          .concat(userRules);
      },
      async member(member, builder, options = {}) {
        const defaultRules = abilities.rules.getDefaultFor('member');
        const memberRules = options.rules || (await abilities.rules.list('member', member.id));
        const agendaRules = (await abilities.get('agenda', member.agendaUid))
          .rules;
        const userRules = (await abilities.get('user', member.userUid)).rules;

        // if ( isAdmin( user ) {
        //   can( ... );
        // } else {
        //   cannot( ... );
        // }

        return agendaRules
          .concat(userRules)
          .concat(defaultRules)
          .concat(builder.rules) // the rules defined with can/cannot in this block
          .concat(memberRules);
      }
    },
    completeFormIndex: {
      user: async (ability, options) => {
        // const { entity: user } = ability;

        // await membersSvc.user( user.uid ).list( 0, 500 );
        const members = options.entities
          ? options.entities.members
          : [{ id: 60815, agendaUid: 48959239, userUid: 99999999 }];
        // const agendas = options.entities
        //   ? options.entities.agendas
        //   : [ { uid: 48959239 } ] // await agendasSvc.list( { ids: _.map( members, 'agendaId' ) } );

        return {
          user: ability.identifier,
          // agenda: agendas.map( v => v.uid ),
          member: members.map(v => v.id)
        };
      },
      agenda: async ability => ({ agenda: ability.identifier })
    },
    editableRules
  }
};
