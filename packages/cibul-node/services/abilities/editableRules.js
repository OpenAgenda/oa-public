'use strict';

module.exports = {
  agenda: () => [
    {
      actions: 'receive',
      subject: 'myEventCreation',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'myEventChangeState',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'myEventUpdate',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'myEventAggregation',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'eventCreation',
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: -1 // refused
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 0 // tocontrol
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 1 // controlled
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 2 // published
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventUpdate',
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventAggregation',
      tag: 'adminmod'
    }
  ],
  user: () => [
    {
      actions: 'receive',
      subject: 'invitation',
      tag: 'user'
    },
    {
      actions: 'receive',
      subject: 'notificationsSummary',
      tag: 'user'
    },
    {
      actions: 'receive',
      subject: 'userInboxMessage',
      tag: 'user'
    },
    {
      actions: 'receive',
      subject: 'event',
      tag: 'user'
    },
    {
      actions: 'receive',
      subject: 'memberMessage',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'myEventCreation',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'myEventChangeState',
      tag: 'contributor'
    },
    // {
    //   actions: 'receive',
    //   subject: 'myEventUpdate',
    //   tag: 'contributor'
    // },
    {
      actions: 'receive',
      subject: 'myEventAggregation',
      tag: 'contributor'
    },
    {
      actions: 'receive',
      subject: 'agendaInboxMessage',
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventCreation',
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: -1 // refused
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 0 // tocontrol
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 1 // controlled
      },
      tag: 'adminmod'
    },
    {
      actions: 'receive',
      subject: 'eventChangeState',
      conditions: {
        state: 2 // published
      },
      tag: 'adminmod'
    },
    // {
    //   actions: 'receive',
    //   subject: 'eventUpdate',
    //   tag: 'adminmod'
    // },
    {
      actions: 'receive',
      subject: 'eventAggregation',
      tag: 'adminmod'
    }
  ],
  member: ( ability, member ) => {
    const contributorRules = [
      {
        actions: 'receive',
        subject: 'memberMessage',
        tag: 'contributor'
      },
      {
        actions: 'receive',
        subject: 'myEventCreation',
        tag: 'contributor'
      },
      {
        actions: 'receive',
        subject: 'myEventChangeState',
        tag: 'contributor'
      },
      // {
      //   actions: 'receive',
      //   subject: 'myEventUpdate',
      //   tag: 'contributor'
      // },
      {
        actions: 'receive',
        subject: 'myEventAggregation',
        tag: 'contributor'
      }
    ];

    if ( [ 2, 3 ].includes( member.credential ) ) {
      return contributorRules.concat( [
        {
          actions: 'receive',
          subject: 'agendaInboxMessage',
          tag: 'adminmod'
        },
        {
          actions: 'receive',
          subject: 'eventCreation',
          tag: 'adminmod'
        },
        {
          actions: 'receive',
          subject: 'eventChangeState',
          conditions: {
            state: -1 // refused
          },
          tag: 'adminmod'
        },
        {
          actions: 'receive',
          subject: 'eventChangeState',
          conditions: {
            state: 0 // tocontrol
          },
          tag: 'adminmod'
        },
        {
          actions: 'receive',
          subject: 'eventChangeState',
          conditions: {
            state: 1 // controlled
          },
          tag: 'adminmod'
        },
        {
          actions: 'receive',
          subject: 'eventChangeState',
          conditions: {
            state: 2 // published
          },
          tag: 'adminmod'
        },
        // {
        //   actions: 'receive',
        //   subject: 'eventUpdate',
        //   tag: 'adminmod'
        // },
        {
          actions: 'receive',
          subject: 'eventAggregation',
          tag: 'adminmod'
        }
      ] );
    }

    return contributorRules;
  }
};
