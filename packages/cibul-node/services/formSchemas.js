import _ from 'lodash';
import formSchemas from '@openagenda/form-schemas';

export function init(config, services) {
  return formSchemas({
    knex: config.knex,
    tmpFolder: config.tmpFolderPath,
    imagePath: config.s3.mainBucketPath,
    s3: _.pick(config.s3, [
      'endpoint',
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
    redis: services.redis.ioRedis,
    cacheTTL: 60_000,
  });
}
