import logger from '@openagenda/logs';
import AgendaFiles from './lib/agendaFiles.js';
import processGenerateRequest from './processGenerateRequest.js';
import App from './app.js';
import defaultState from './defaultState.js';

function getState({ s3 }, agendaUid) {
  return AgendaFiles({
    s3,
    bucket: s3.bucket,
    uid: agendaUid,
  }).getJSON('state.json', defaultState);
}

export default function AgendaDocx(options = {}) {
  const { onProcessGenerateRequest, localTmpPath, s3, bucketPath } = options;

  if (options.logger) {
    logger.setModuleConfig(options.logger);
  }

  return {
    app: App({
      onProcessGenerateRequest,
      s3,
      bucketPath,
    }),
    getState: getState.bind(null, { s3 }),
    processGenerateRequest: processGenerateRequest.bind(null, {
      s3,
      localTmpPath,
    }),
  };
}
