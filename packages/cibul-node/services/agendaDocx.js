import AgendaDocx from '@openagenda/agenda-docx';
import logger from '@openagenda/logs';
import { requireUser } from '../lib/authGuards.js';

const log = logger('services/agenda-docx');

function plugApp(agendaDocx, app) {
  const { agendas, members } = app.services;

  app.use(
    '/docx/:agendaUid',
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid',
    }),
    requireUser,
    members.mw.loadAndAuthorize('moderator'),
  );

  app.use('/docx', agendaDocx.app);
}

export function init(config, services) {
  const { bull } = services;

  const queue = new bull.Queue('agendaDocx', { prefix: '{agendaDocx}' });

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
    localTmpPath: config.tmpFolderPath,
    onProcessGenerateRequest: (jobData) => {
      console.log('processGenerateRequest', jobData);
      return queue.add('processGenerateRequest', jobData);
    },
  });

  agendaDocx.plugApp = (app) => plugApp(agendaDocx, app);

  const worker = new bull.Worker(
    queue.name,
    (job) => {
      switch (job.name) {
        case 'processGenerateRequest': {
          return agendaDocx.processGenerateRequest(job.data);
        }
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  worker.on('error', (failedReason) => log.error('error', failedReason));

  agendaDocx.task = () => worker.run();

  agendaDocx.shutdown = async () => {
    await worker.close();
  };

  return agendaDocx;
}
