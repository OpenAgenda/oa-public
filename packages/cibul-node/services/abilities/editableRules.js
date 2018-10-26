'use strict';

module.exports = {
  agenda: [
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
  user: [
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
  member: [
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
