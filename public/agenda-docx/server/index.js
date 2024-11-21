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
  const { queue, localTmpPath, s3 } = options;

  if (options.logger) {
    logger.setModuleConfig(options.logger);
  }

  if (queue) {
    queue.register({
      processGenerateRequest: processGenerateRequest.bind(null, {
        s3,
        localTmpPath,
      }),
    });
  }

  return {
    app: App({
      queue,
      s3,
    }),
    getState: getState.bind(null, { s3 }),
  };
}
