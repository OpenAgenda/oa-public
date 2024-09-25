'use strict';

const express = require('express');

const logger = require('@openagenda/logs');
const AgendaFiles = require('./lib/agendaFiles');
const processGenerateRequest = require('./processGenerateRequest');
const App = require('./app');

const defaultState = require('./defaultState');

function getState({ s3 }, agendaUid) {
  return AgendaFiles({
    s3,
    bucket: s3.bucket,
    uid: agendaUid,
  }).getJSON('state.json', defaultState);
}

module.exports = function AgendaDocx(options = {}) {
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
    dist: express.static(`${__dirname}/../client/dist`),
  };
};
