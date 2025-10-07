export default {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },

  mysql: {
    host: '127.0.0.1',
    database: 'oatest_agenda_event',
    password: 'grut',
    user: 'root',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },

  schemas: {
    agendaEvent: 'agenda_event',
  },

  // given by agenda service
  eventStates: {
    REFUSED: -1,
    NOT_VALIDATED: 0,
    VALIDATED: 1,
    PUBLISHED: 2,
  },

  interfaces: {
    onCreate: (_agendaEvent) => {},

    onUpdate: (_agendaEvent) => {},

    beforeRemove: async (_agendaEvent) => {},

    onRemove: (_agendaEvent) => {},
  },
};
