'use strict';

const express = require('express');

const logger = require('@openagenda/logs');
const AgendaFiles = require('./lib/agendaFiles');
const config = require('./config');
const queue = require('./queue');
const task = require('./task');
const app = require('./app');

const defaultState = require('./defaultState');

function getState(agendaUid) {
  return AgendaFiles({
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: agendaUid,
  }).getJSON('state.json', defaultState);
}

module.exports = {
  init: c => {
    if (c.logger) {
      logger.setModuleConfig(c.logger);
    }

    config.init(c);

    queue.init(c.queue);
  },
  app,
  task,
  getState,
  dist: express.static(`${__dirname}/../client/dist`),
};
