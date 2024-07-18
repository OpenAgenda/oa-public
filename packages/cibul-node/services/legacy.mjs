import fs from 'node:fs';
import ControlData from '@openagenda/legacy/controlData/index.js';
import Embeds from '@openagenda/legacy/embeds/index.js';
import TagsAndCustom from '@openagenda/legacy/tagsAndCustom/index.js';
import GetTagSet from '@openagenda/legacy/getTagSet.js';
import GetCategorySet from '@openagenda/legacy/getCategorySet.js';
import * as utils from '@openagenda/legacy/utils/index.js';

export const controlData = {};
export const tagsAndCustom = {};
export { utils };
export const sets = {};

function task() {
  controlData.task();
  tagsAndCustom.task();
}

export function init(config, services) {
  const {
    knex,
    redis,
    queues: Queues,
    agendas,
  } = services;

  const interfaces = {
    getAgendaId: agendaUid => agendas.get({
      uid: agendaUid,
    }, {
      internal: true,
      private: null,
    }).then(a => a?.id),
  };

  ControlData.updateLoggerConfig(config.getLogConfig('svc', 'controlData'));
  TagsAndCustom.updateLoggerConfig(config.getLogConfig('svc', 'legacyTagsAndCustom'));
  Embeds.updateLoggerConfig(config.getLogConfig('svc', 'embeds'));

  Object.assign(controlData, ControlData({
    knex,
    redis,
    prefix: 'agendaControlData:',
    imagePath: config.aws.imageBucketPath,
  }));

  Object.assign(tagsAndCustom, TagsAndCustom({
    knex,
    queue: Queues('legacyTagsAndCustom'),
    interfaces,
  }));

  const getTagSet = GetTagSet({ knex });
  const getCategorySet = GetCategorySet({ knex });

  Object.assign(sets, {
    getTagSet,
    getCategorySet,
  });

  const embeds = Embeds({
    knex,
    interfaces,
    defaultTemplates: {
      eventitem: fs.readFileSync(new URL('./embed/templates/eventItem.tblr', import.meta.url), 'utf-8'),
      event: fs.readFileSync(new URL('./embed/templates/event.tblr', import.meta.url), 'utf-8'),
      header: fs.readFileSync(new URL('./embed/templates/header.tblr', import.meta.url), 'utf-8'),
    },
  });

  return {
    controlData,
    tagsAndCustom,
    utils,
    getTagSet,
    getCategorySet,
    embeds,
    task,
  };
}
