'use strict';

const bodyParser = require('body-parser');
const log = require('@openagenda/logs')('reports');

module.exports.init = config => {
  log.setConfig(config.getLogConfig('oa', 'reports'));

  return {
    plugApp(app) {
      app.post(
        '/reports',
        bodyParser.json({ type: 'application/reports+json', limit: '5mb' }),
        (req, res) => {
          if (req.body) {
            log.info(req.body);
          }
          res.status(200).send('OK');
        },
      );
    },
  };
};
