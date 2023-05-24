'use strict';

const bodyParser = require('body-parser');

// Change host appropriately if you run your own Sentry instance.
const sentryHost = 'sentry.io';

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const knownProjectIds = ['128991'];

module.exports = app => {
  app.post(
    '/monit',
    bodyParser.text(),
    async (req, res, next) => {
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
        const sentryResponse = await fetch(sentryIngestURL, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-sentry-envelope',
          }),
          body: envelope,
        });

        // Relay response from Sentry servers to front end
        sentryResponse.headers.forEach((value, key) => res.setHeader(key, value));
        res.status(sentryResponse.status).send(sentryResponse.body);
      } catch (error) {
        res.status(400);
        next(error);
      }
    },
  );
};
