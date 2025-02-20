'use strict';

module.exports = {
  mysql: {
    database: 'oa_members_test',
    host: 'localhost',
    user: 'root',
    password: 'grut',
  },
  schemas: {
    activity: 'activity',
    feed: 'activity_feed',
    feed_activity: 'activity_feed_activity',
    feed_follow: 'activity_feed_follow',
    feed_notification: 'activity_feed_notification',
    agenda: 'agenda',
    agendaEvent: 'agenda_event',
    apiKeySet: 'api_key_set',
    event: 'event',
    legacyCredentialSet: 'legacy_credential_set',
    occurrence: 'occurrence',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'agenda_stakeholder_settings',
    user: 'user',
  },

  mw: {
    limit: 20,
  },

  queue: {
    names: {
      addActivity: 'notificationAddActivityTest',
      sendSummary: 'notificationSendSummaryTest',
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
  },

  services: {
    sessions: {
      sessionCookie: {
        name: 'oa',
        keys: ['k', 'e', 'y', 's'],
        maxAge: 1000 * 60 * 60 * 48, // 2 days
        signed: true,
        secure: false,
        httpOnly: false,
      },
      writableCookie: {
        maxAge: 1000 * 60 * 60 * 48,
        name: 'oa.rw', // overriden by iso configuration
      },
      expire: 60 * 60 * 48,
      redis: {
        host: 'localhost',
        port: 6379,
        hash: 'sessionstest',
      },
      interfaces: {
        getUser: (query, cb) => {
          cb(null, {
            id: 2,
            uid: 99999999,
            culture: 'fr',
            name: 'Kévin',
          });
        },
      },
    },
  },
};
