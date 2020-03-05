"use strict";

const _ = require('lodash');
const states = require('@openagenda/agenda-events/iso/states');

module.exports = async (eventSearch, agenda) => {
  const {
    total
  } = await eventSearch.agendas(agenda).search({ state: null }, { size: 0 });

  const {
    total: published
  } = await eventSearch.agendas(agenda).search({
    state: states.PUBLISHED
  }, { size: 0 });

  const {
    total: toBeCompleted
  } = await eventSearch.agendas(agenda).search({
    state: states.TOCONTROL
  }, { size: 0 });

  const {
    total: readyToPublish
  } = await eventSearch.agendas(agenda).search({
    state: states.CONTROLLED
  }, { size: 0 });

  const {
    total: refused
  } = await eventSearch.agendas(agenda).search({
    state: states.REFUSED
  }, { size: 0 });

  return {
    total,
    published,
    readyToPublish,
    toBeCompleted,
    refused,
    checksum: total === published + toBeCompleted + readyToPublish + refused
  };
}
