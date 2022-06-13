'use strict';

const _ = require('lodash');
const express = require('express');

const bodyParser = require('body-parser');

const log = require('@openagenda/logs')('server.dev');

const filesMw = require('./server/middleware/files');
const schemaMw = require('./server/middleware/schema');

const devMw = require('./dev/middleware');

const config = require('./testconfig');

// normally done through init of service
filesMw.init({
  tmpFolder: __dirname + '/dev/tmp',
  s3: _.pick(config.s3, ['accessKeyId', 'secretAccessKey', 'region', 'bucket'])
});

const devSchemas = require('./dev/schemas');

const dev = express();

dev.post('/formbuilder',
  bodyParser.json(),
  (req, res, next) => {

    console.log(req.body);
    console.log('waiting for a while...');

    setTimeout(() => {
      res.status(200).send();
    }, 3000);
  }
);

dev.post('/:page',
  bodyParser.json(),
  (req, res, next) => {

    if (req.params.page === 'imageuploadtoolarge') {
      return res.status(413).send();
    }

    // when resources are loaded or posted for a specific instance,
    // created or yet to be created, the server
    // should know what schema is being created

    const { schema, values, fileKey } = _.get(devSchemas, req.params.page);

    log('received post for %j', schema);

    req.schema = schema;
    req.values = values; // these are the current values
    req.fileKey = fileKey;

    next();

  },
  filesMw.putInTemporary.bind(null, { /* use defaults */ }),
  filesMw.uploadFilesToS3.bind(null, { /* defaults */ }),
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
      message: 'ok, ' + req.params.page
    });

  }
);

dev.listen(3000);
