'use strict';

const _ = require('lodash');
const formSchemas = require('@openagenda/form-schemas');

module.exports.init = config => formSchemas({
  knex: config.knex,
  tmpFolder: config.tmpFolderPath,
  s3: _.pick(config.aws, [
    'accessKeyId',
    'secretAccessKey',
    'region',
    'bucket',
  ]),
  schemas: {
    formSchema: 'form_schema',
    network: 'network',
  },
  logger: config.getLogConfig('svc', 'form-schemas'),
});
