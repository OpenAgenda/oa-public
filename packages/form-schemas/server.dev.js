import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import logs from '@openagenda/logs';
import filesMw from './server/middleware/files.js';
import schemaMw from './server/middleware/schema.js';
import devMw from './dev/middleware/index.js';
import config from './testconfig.js';

const log = logs('server.dev');

// normally done through init of service
filesMw.init({
  tmpFolder: `${__dirname}/dev/tmp`,
  s3: _.pick(config.s3, [
    'endpoint',
    'accessKeyId',
    'secretAccessKey',
    'region',
    'bucket',
  ]),
  imagePath: config.imagePath,
});

const dev = express();

dev.post('/formbuilder', bodyParser.json(), (req, res) => {
  console.log(req.body);
  console.log('waiting for a while...');

  setTimeout(() => {
    res.status(200).send();
  }, 3000);
});

dev.post(
  '/:page',
  bodyParser.json(),
  async (req, res, next) => {
    if (req.params.page === 'imageuploadtoolarge') {
      return res.status(413).send();
    }

    // when resources are loaded or posted for a specific instance,
    // created or yet to be created, the server
    // should know what schema is being created

    const { schema, values, fileKey } = (
      await import(`./dev/schemas/${req.params.page}.js`)
    ).default;

    log('received post for %j', schema);

    req.schema = schema;
    req.values = values; // these are the current values
    req.fileKey = fileKey;

    next();
  },
  filesMw.putInTemporary.bind(null, {
    /* use defaults */
  }),
  filesMw.uploadFilesToS3.bind(null, {
    /* defaults */
  }),
  filesMw.cleanFileValues.bind(null, {}),
  schemaMw.clean.bind(null, {}),
  devMw,
  (req, res, next) => {
    // this here should include file values
    console.log('clean', req.clean);

    next();
  },
  (req, res) => {
    res.json({
      message: `ok, ${req.params.page}`,
    });
  },
);

dev.listen(3000);
