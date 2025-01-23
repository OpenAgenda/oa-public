import AgendaDocx from '@openagenda/agenda-docx';

function plugApp(agendaDocx, app) {
  const { agendas, members, sessions } = app.services;

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

export function init(config, services) {
  const queue = services.queues('docx');

  const agendaDocx = AgendaDocx({
    logger: config.getLogConfig('svc', 'agenda-docx'),
    s3: {
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
      bucket: 'docx',
    },
    bucketPath: config.s3.docxBucketPath,
    queue,
    localTmpPath: config.tmpFolderPath,
  });

  agendaDocx.plugApp = (app) => plugApp(agendaDocx, app);

  agendaDocx.task = queue.run;

  return agendaDocx;
}
