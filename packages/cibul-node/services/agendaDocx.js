'use strict';

const AgendaDocx = require('@openagenda/agenda-docx');

function plugApp(agendaDocx, app) {
  const {
    agendas,
    members,
    sessions,
  } = app.services;

  app.use('/docx/dist', agendaDocx.dist);

  app.use(
    '/docx/:agendaUid',
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid',
    }),
    sessions.mw.loadOrRedirect(),
    members.mw.loadAndAuthorize('moderator'),
  );

  app.use('/docx', agendaDocx.app);
}

module.exports.init = (config, services) => {
  const queue = services.queues('docx');

  const agendaDocx = AgendaDocx({
    logger: config.getLogConfig('svc', 'agenda-docx'),
    s3: {
      region: 'eu-west-3',
      bucket: 'oa-docx',
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    queue,
    localTmpPath: config.tmpFolderPath,
  });

  agendaDocx.plugApp = app => plugApp(agendaDocx, app);

  agendaDocx.task = queue.run;

  return agendaDocx;
};
