"use strict";

const _ = require('lodash');
const { default: inboxes } = require('@openagenda/inboxes');
const inboxMw = require('@openagenda/inboxes/dist/middleware');
const agendasSvc = require('@openagenda/agendas');
const log = require('@openagenda/logs')('services/inboxes');
const inboxesLabels = require('@openagenda/labels/inboxes');
const filterAction = require('./filterAction');
const getInboxesDetails = require('./getInboxesDetails');
const getUsersDetails = require('./getUsersDetails');
const onAction = require('./onAction');
const onInboxCreate = require('./onInboxCreate');
const onMessageCreate = require('./onMessageCreate');
const usersSvc = require('../users');
const membersSvc = require('../members');
const config = require('../../config');

const loggerConfig = config.getLogConfig('oa', 'inboxes', false);

log.setConfig(loggerConfig);


const interfaces = {
  getUsersDetails,
  getInboxesDetails,
  onInboxCreate,
  onMessageCreate,
  filterAction,
  onAction
};

module.exports.init = async c => {
  await inboxes.init(
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
        'queues.inboxesSync',
        'aws'
      ]),
      {
        logger: loggerConfig,
        migrations: {
          tableName: 'inboxes_migrations'
        },
        services: {
          agendas: () => agendasSvc,
          members: () => membersSvc,
          users: () => usersSvc
        },
        interfaces,
        defaultAction: {
          code: 'default',
          label: {
            fr: 'Fermer la conversation',
            en: 'Close the conversation'
          },
          kind: 'success'
        },
        types: {
          event: {
            actions: [
              {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support'
                },
                kind: 'default',
                resolve: false
              }, {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support'
                },
                kind: 'default',
                resolve: false
              }
            ]
          },
          contact_form: {
            actions: [
              {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support'
                },
                kind: 'default',
                resolve: false
              }, {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support'
                },
                kind: 'default',
                resolve: false
              }
            ]
          },
          request_contribute: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Ajouter en tant que contributeur',
                  en: 'Add as a contributor'
                },
                kind: 'primary',
                confirmationModalTitle: inboxesLabels.requestContributeAcceptModalTitle,
                confirmationModalLabel: inboxesLabels.requestContributeAcceptModal
              }, {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request'
                },
                kind: 'danger',
                confirmationModalTitle: inboxesLabels.requestContributeRefuseModalTitle,
                confirmationModalLabel: inboxesLabels.requestContributeRefuseModal
              }, {
                code: 'involveTechnicalSupport',
                label: {
                  fr: 'Impliquer le support technique',
                  en: 'Involve technical support'
                },
                kind: 'default',
                resolve: false
              }
            ]
          },
          edition_request: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Accepter la demande',
                  en: 'Accept the request'
                },
                kind: 'primary',
                confirmationModalTitle: inboxesLabels.editionRequestAcceptModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestAcceptModal
              }, {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request'
                },
                kind: 'danger',
                confirmationModalTitle: inboxesLabels.editionRequestRefuseModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestRefuseModal
              }
            ]
          },
          suggest_location_change: {},
          contact_member: {},
          support: {
            actions: [
              {
                code: 'removeTechnicalSupport',
                label: {
                  fr: 'Retirer le support technique',
                  en: 'Remove technical support'
                },
                kind: 'default',
                resolve: false
              }
            ]
          }
        },
        defaultImagePath: c.aws.defaultImagePath
      }
    )
  );
  await inboxMw.init(_.merge({}, c, { interfaces, mw: { limit: 20 } }));
};
