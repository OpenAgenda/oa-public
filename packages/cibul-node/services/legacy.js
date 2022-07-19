'use strict';

const fs = require('fs');
const ControlData = require('@openagenda/legacy/controlData');
const Embeds = require('@openagenda/legacy/embeds');
const TagsAndCustom = require('@openagenda/legacy/tagsAndCustom');
const GetTagSet = require('@openagenda/legacy/getTagSet');
const GetCategorySet = require('@openagenda/legacy/getCategorySet');
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
  Embeds.updateLoggerConfig(config.getLogConfig('svc', 'embeds'));

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

  module.exports.getTagSet = GetTagSet({ knex });
  module.exports.getCategorySet = GetCategorySet({ knex });

  module.exports.embeds = Embeds({
    knex,
    interfaces,
    defaultTemplates: {
      eventitem: fs.readFileSync(`${__dirname}/embed/templates/eventItem.tblr`, 'utf-8'),
      event: fs.readFileSync(`${__dirname}/embed/templates/event.tblr`, 'utf-8'),
      header: fs.readFileSync(`${__dirname}/embed/templates/header.tblr`, 'utf-8')
    }
  });

  return module.exports;
};

module.exports.task = () => {
  module.exports.controlData.task();
  module.exports.tagsAndCustom.task();
};
