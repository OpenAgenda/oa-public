import bodyParser from 'body-parser';
import logs from '@openagenda/logs';

const log = logs('reports');

function logReport(report) {
  if (
    report?.body?.sourceFile?.startsWith('chrome-extension')
    || report?.body?.sourceFile?.startsWith('safari-extension')
    || report?.body?.sourceFile?.startsWith('moz-extension')
    || report?.['csp-report']?.['blocked-uri']?.startsWith('chrome-extension')
    || report?.['csp-report']?.['source-file']?.startsWith('safari-extension')
    || report?.['csp-report']?.['source-file']?.startsWith('moz-extension')
  ) {
    return;
  }

  log.info(report);
}

export function init(config) {
  log.setConfig(config.getLogConfig('oa', 'reports'));

  return {
    plugApp(app) {
      app.post(
        '/reports',
        bodyParser.json({
          type: ['application/reports+json', 'application/csp-report'],
          limit: '5mb',
        }),
        (req, res, next) => {
          try {
            if (Array.isArray(req.body)) {
              for (const row of req.body) {
                logReport({ headers: req.headers, ...row });
              }
            } else if (req.body) {
              logReport({ headers: req.headers, ...req.body });
            }
            res.status(200).send('OK');
          } catch (e) {
            next(e);
          }
        },
        (err, req, res, _next) => {
          res.status(400).send('Bad Request');
        },
      );
    },
  };
}
