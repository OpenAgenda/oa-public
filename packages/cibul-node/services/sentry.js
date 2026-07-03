import bodyParser from 'body-parser';
import { dsnFromString } from '@sentry/core';
import logs from '@openagenda/logs';

const log = logs('services/sentry');

// Sentry ingest hosts are of the form `o<orgId>.ingest.<region>.sentry.io`
// (the region segment is absent for legacy US-only DSNs).
const sentryIngestHost = /^o\d+\.ingest\.(?:[a-z]{2}\.)?sentry\.io$/;

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const knownProjectIds = ['4511659413995600'];

export default (app) => {
  app.post(
    '/monit',
    bodyParser.text(),
    async (req, res) => {
      try {
        const envelope = req.body;

        const pieces = envelope.split('\n');
        const header = JSON.parse(pieces[0]);
        // DSNs are of the form
        // `https://<key>@o<orgId>.ingest.<region>.sentry.io/<projectId>`
        const { host, projectId } = dsnFromString(header.dsn) ?? {};

        if (!host || !sentryIngestHost.test(host)) {
          throw new Error(`invalid host: ${host}`);
        }

        if (!knownProjectIds.includes(projectId)) {
          throw new Error(`invalid project id: ${projectId}`);
        }

        // Forward to the DSN's own (region-specific) ingest host.
        const sentryIngestURL = `https://${host}/api/${projectId}/envelope/`;
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
