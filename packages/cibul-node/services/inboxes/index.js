'use strict';

const _ = require('lodash');
const inboxes = require('@openagenda/inboxes');
const inboxMw = require('@openagenda/inboxes/dist/middleware');
const log = require('@openagenda/logs')('services/inboxes');
const inboxesLabels = require('@openagenda/labels/inboxes');
const config = require('../../config');
const filterAction = require('./filterAction');
const getInboxesDetails = require('./getInboxesDetails');
const getUsersDetails = require('./getUsersDetails');
const onAction = require('./onAction');
const onInboxCreate = require('./onInboxCreate');
const onMessageCreate = require('./onMessageCreate');

const loggerConfig = config.getLogConfig('oa', 'inboxes', false);

log.setConfig(loggerConfig);

const getApp = require('./getApp');

module.exports.init = async (c, services) => {
  const {
    queues,
    redis,
  } = services;

  const interfaces = {
    getUsersDetails: getUsersDetails.bind(null, services),
    onMessageCreate: onMessageCreate.bind(null, services),
    getInboxesDetails: getInboxesDetails.bind(null, services),
    onAction: onAction.bind(null, services),
    onInboxCreate,
    filterAction,
  };

  const queue = queues(config.queues.inboxesSync);

  const service = await inboxes(
    _.merge(
      _.pick(c, [
        'mysql',
        'knex',
        'redis',
        'schemas.inbox',
        'schemas.inboxUser',
        'schemas.conversation',
        'schemas.inboxConversation',
        'schemas.message',
        'schemas.messageAttachment',
        'aws',
        'uppy',
      ]),
      {
        logger: loggerConfig,
        migrations: {
          tableName: 'inboxes_migrations',
        },
        services: {
          agendas: () => services.agendas,
          members: () => services.members,
          users: () => services.users,
        },
        redis,
        queue,
        interfaces,
        defaultAction: {
          code: 'default',
          label: {
            fr: 'Fermer la conversation',
            en: 'Close the conversation',
          },
          kind: 'success',
        },
        types: {
          event: {
            actions: [
              {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support',
                },
                kind: 'default',
                resolve: false,
              }, {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support',
                },
                kind: 'default',
                resolve: false,
              },
            ],
          },
          contact_form: {
            actions: [
              {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support',
                },
                kind: 'default',
                resolve: false,
              }, {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support',
                },
                kind: 'default',
                resolve: false,
              },
            ],
          },
          request_contribute: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Ajouter en tant que contributeur',
                  en: 'Add as a contributor',
                },
                kind: 'primary',
                confirmationModalTitle: inboxesLabels.requestContributeAcceptModalTitle,
                confirmationModalLabel: inboxesLabels.requestContributeAcceptModal,
              }, {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request',
                },
                kind: 'danger',
                confirmationModalTitle: inboxesLabels.requestContributeRefuseModalTitle,
                confirmationModalLabel: inboxesLabels.requestContributeRefuseModal,
              }, {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support',
                },
                kind: 'default',
                resolve: false,
              },
            ],
          },
          edition_request: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Accepter la demande',
                  en: 'Accept the request',
                },
                kind: 'primary',
                confirmationModalTitle: inboxesLabels.editionRequestAcceptModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestAcceptModal,
              }, {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request',
                },
                kind: 'danger',
                confirmationModalTitle: inboxesLabels.editionRequestRefuseModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestRefuseModal,
              },
            ],
          },
          suggest_location_change: {},
          contact_member: {},

          // call to actions
          request_member_schema: {},
          request_agenda_schema: {},
          request_private_agenda: {},
          request_public_agenda: {},
          request_official_agenda: {},
          request_limit_dates: {},
          request_moderators: {},
          request_write_to_all: {},

          support: {
            actions: [
              {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support',
                },
                kind: 'default',
                resolve: false,
              },
            ],
          },
        },
        defaultImagePath: c.aws.defaultImagePath,
        mw: {
          limit: 20,
        },
      },
    ),
  );

  await inboxMw.init(service);

  Object.assign(service, {
    getApp: getApp.bind(null, c, services),
    task: () => queue.run(),
    shutdown: (options = {}) => queue.stop({
      remove: true,
      clear: options.reset ?? false,
    }),
  });

  Object.assign(module.exports, service);

  return service;
};
