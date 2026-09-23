import config from '../config.dev.js';
import Service from '../server/index.js';

const service = Service({
  s3: config.s3,
  localTmpPath: config.localTmpPath,
  onProcessGenerateRequest: (jobData) =>
    service.processGenerateRequest(jobData),
});

export default (router) => {
  console.log('init server');
  router.use('/docx', service.app);
};
