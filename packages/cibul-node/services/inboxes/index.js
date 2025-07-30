import _ from 'lodash';
import companion from '@uppy/companion';
import inboxes from '@openagenda/inboxes';
import * as inboxMw from '@openagenda/inboxes/src/middleware.js';
import inboxesLabels from '@openagenda/labels/inboxes/index.js';
import filterAction from './filterAction.js';
import getInboxesDetails from './getInboxesDetails.js';
import getUsersDetails from './getUsersDetails.js';
import onAction from './onAction.js';
import onInboxCreate from './onInboxCreate.js';
import onMessageCreate from './onMessageCreate.js';
import plugApp from './plugApp/index.js';

export async function init(config, services) {
  const { queues, redis } = services;

  const {
    mails: { domain: mailsDomain },
  } = config;

  const interfaces = {
    getUsersDetails: getUsersDetails.bind(null, services),
    onMessageCreate: onMessageCreate.bind(null, { services, mailsDomain }),
    getInboxesDetails: getInboxesDetails.bind(null, services),
    onAction: onAction.bind(null, services),
    onInboxCreate: onInboxCreate.bind(null, services),
    filterAction: filterAction.bind(null, services),
  };

  const queue = queues(config.queues.inboxesSync);

  const service = await inboxes(
    _.merge(
      _.pick(config, [
        'mysql',
        'knex',
        'redis',
        'schemas.inbox',
        'schemas.inboxUser',
        'schemas.conversation',
        'schemas.inboxConversation',
        'schemas.message',
        'schemas.messageAttachment',
        'schemas.emailUtilsMessageIds',
        'schemas.emailUtilsReplyTos',
        's3',
        'uppy',
      ]),
      {
        mailsDomain: config.mails.domain,
        logger: config.getLogConfig('oa', 'inboxes'),
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
              },
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
              },
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
          request_contribute: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Ajouter en tant que contributeur',
                  en: 'Add as a contributor',
                },
                kind: 'primary',
                confirmationModalTitle:
                  inboxesLabels.requestContributeAcceptModalTitle,
                confirmationModalLabel:
                  inboxesLabels.requestContributeAcceptModal,
              },
              {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request',
                },
                kind: 'danger',
                confirmationModalTitle:
                  inboxesLabels.requestContributeRefuseModalTitle,
                confirmationModalLabel:
                  inboxesLabels.requestContributeRefuseModal,
              },
              {
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
                confirmationModalTitle:
                  inboxesLabels.editionRequestAcceptModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestAcceptModal,
              },
              {
                code: 'refuse',
                label: {
                  fr: 'Refuser la demande',
                  en: 'Refuse the request',
                },
                kind: 'danger',
                confirmationModalTitle:
                  inboxesLabels.editionRequestRefuseModalTitle,
                confirmationModalLabel: inboxesLabels.editionRequestRefuseModal,
              },
            ],
          },
          suggest_location_change: {},
          suggest_event_change: {},
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
        defaultImagePath: config.s3.defaultImagePath,
        mw: {
          limit: 20,
        },
        uppyCompanion: companion.app({
          s3: {
            getKey: ({ filename }) => filename,
            endpoint: 'https://s3.pub1.infomaniak.cloud',
            key: config.s3.accessKeyId,
            secret: config.s3.secretAccessKey,
            bucket: config.s3.bucket,
            region: config.s3.region,
            acl: 'public-read',
            awsClientOptions: {
              forcePathStyle: true,
            },
          },
          server: {
            host: config.domain,
            protocol: 'https',
          },
          secret: config.uppy.secret,
          debug: true,
          filePath: config.tmpFolderPath,
          uploadUrls: [RegExp(`/^https:\\/\\/${config.domain}\\//`)],
        }),
      },
    ),
  );

  await inboxMw.init(service);

  Object.assign(service, {
    plugApp: plugApp.bind(null, config, services),
    task: () => queue.run(),
    shutdown: (options = {}) =>
      queue.stop({
        remove: true,
        clear: options.reset ?? false,
      }),
  });

  return service;
}
