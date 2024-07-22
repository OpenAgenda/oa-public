import _ from 'lodash';
import formSchemas from '@openagenda/form-schemas';

export function init(config) {
  return formSchemas({
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
}
