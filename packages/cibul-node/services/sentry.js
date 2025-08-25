import bodyParser from 'body-parser';
import logs from '@openagenda/logs';

const log = logs('services/sentry');

// Change host appropriately if you run your own Sentry instance.
const sentryHost = 'sentry.io';

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const knownProjectIds = ['128991'];

export default (app) => {
  app.post(
    '/monit',
    bodyParser.text(),
    async (req, res) => {
      try {
        const envelope = req.body;

        const pieces = envelope.split('\n');
        const header = JSON.parse(pieces[0]);
        // DSNs are of the form `https://<key>@o<orgId>.ingest.sentry.io/<projectId>`
        const { host, pathname } = new URL(header.dsn);
        // Remove leading slash
        const projectId = pathname.substring(1);

        if (!host.match(/^o(\d+)\.ingest\.sentry\.io$/)) {
          throw new Error(`invalid host: ${host}`);
        }

        if (!knownProjectIds.includes(projectId)) {
          throw new Error(`invalid project id: ${projectId}`);
        }

        const sentryIngestURL = `https://${sentryHost}/api/${projectId}/envelope/`;
        await fetch(sentryIngestURL, {
          method: 'POST',
          body: envelope,
        });

        res.status(200).send({});
      } catch (error) {
        log.error('error tunneling to sentry', error);
        res.status(500).json({ error: 'error tunneling to sentry' });
      }
    },
    (err, req, res, _next) => res.status(err?.code ?? 500).send(),
  );
};
