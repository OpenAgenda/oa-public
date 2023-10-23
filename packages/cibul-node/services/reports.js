'use strict';

const bodyParser = require('body-parser');
const log = require('@openagenda/logs')('reports');

function logReport(report) {
  if (report?.body?.sourceFile?.startsWith('chrome-extension')) {
    return;
  }

  log.info(report);
}

module.exports.init = config => {
  log.setConfig(config.getLogConfig('oa', 'reports'));

  return {
    plugApp(app) {
      app.post(
        '/reports',
        bodyParser.json({ type: 'application/reports+json', limit: '5mb' }),
        bodyParser.json({ type: 'application/csp-report', limit: '5mb' }),
        (req, res) => {
          if (Array.isArray(req.body)) {
            for (const row of req.body) {
              logReport({ headers: req.headers, ...row });
            }
          } else if (req.body) {
            logReport({ headers: req.headers, ...req.body });
          }
          res.status(200).send('OK');
        },
      );
    },
  };
};
