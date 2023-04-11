'use strict';

const log = require('@openagenda/logs')('agendaEvents/onRemove');

module.exports = async (_, ae, context) => {
  log('removed agenda-event %j', ae, { context });
};
