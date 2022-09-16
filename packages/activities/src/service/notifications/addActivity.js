'use strict';

const queue = require('@openagenda/queue');

module.exports = config => {
  const q = queue(config.queue.names.addActivity, { redis: config.queue.redis });

  return (identifiers, activity) => q({ identifiers, activity });
};
