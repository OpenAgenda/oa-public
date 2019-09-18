'use strict';

const keysSvc = require('@openagenda/keys');

module.exports = {
  paginate: {
    default: 20,
    max: 100
  },
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_users',
    password: 'grut',
    user: 'root'
  },
  schemas: {
    user: 'user',
    apiKeySet: 'api_key_set',
    unsubscribed: 'unsubscribed',
    key: 'key',
    userToken: 'user_token'
  },
  files: {
    tmpPath: '/var/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },
  imagePath: '//openagendatst.s3.amazonaws.com/',
  interfaces: {
    getAgenda: (agendaUid, cb) => cb(
      null,
      agendaUid === 85870128
        ? {
          slug: 'journees-arts-culture-sup-2017',
          title:
                "2017 : Journées des Arts et de la Culture dans l'Enseignement Supérieur"
        }
        : {
          slug: 'semaineindustrie2017',
          title: "Semaine de l'Industrie 2017"
        }
    ),
    onActivation() {
      return async context => {
        const user = context.result;

        if (!user) {
          return context;
        }

        await context.service.generateApiKey(user.uid, {
          publicKey: true
        });
      };
    },
    keys: {
      get: identifiers => keysSvc(identifiers).get(),
      create: (identifiers, data) => keysSvc(identifiers).create(data),
      remove: identifiers => keysSvc(identifiers).remove()
    }
  },
  redis: {
    connection: {
      host: 'localhost',
      port: 6379
    }
  },
  cache: {
    duration: 60
  }
};
