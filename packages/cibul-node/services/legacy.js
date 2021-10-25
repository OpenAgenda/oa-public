'use strict';

const ControlData = require('@openagenda/legacy/controlData');
const Embeds = require('@openagenda/legacy/embeds');
const TagsAndCustom = require('@openagenda/legacy/tagsAndCustom');
const utils = require('@openagenda/legacy/utils');

module.exports.controlData = {};
module.exports.tagsAndCustom = {};
module.exports.utils = utils;

module.exports.init = (config, services) => {
  const {
    knex,
    redis,
    queues: Queues,
    agendas
  } = services;

  const interfaces = {
    getAgendaId: agendaUid => agendas.get({
      uid: agendaUid
    }, {
      internal: true,
      private: null
    }).then(a => a?.id)
  };

  ControlData.updateLoggerConfig(config.getLogConfig('svc', 'controlData'));
  TagsAndCustom.updateLoggerConfig(config.getLogConfig('svc', 'legacyTagsAndCustom'));

  Object.assign(module.exports.controlData, ControlData({
    knex,
    redis,
    prefix: 'agendaControlData:',
    imagePath: config.aws.imageBucketPath
  }));

  Object.assign(module.exports.tagsAndCustom, TagsAndCustom({
    knex,
    queue: Queues('legacyTagsAndCustom'),
    interfaces
  }));

  module.exports.embeds = Embeds({
    knex,
    interfaces
  });

  return module.exports;
};

module.exports.task = () => {
  module.exports.controlData.task();
  module.exports.tagsAndCustom.task();
};
