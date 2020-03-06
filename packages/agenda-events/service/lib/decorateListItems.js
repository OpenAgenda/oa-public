'use strict';

const _ = require('lodash');

const getPathLeaves = item =>(item.sourcePaths || []).filter(p => p.length).map(p => p[p.length-1]);

module.exports = async (service, items = [], decorate = []) => {
  const {
    config
  } = service;

  if (!config.interfaces) {
    return;
  }

  let members, sourceAgendas;

  if (decorate.includes('member') && config.interfaces.getMembers) {
    members = await config.interfaces.getMembers(items);
  }

  if (decorate.includes('sourceAgendas') && config.interfaces.getSourceAgendas) {
    const sourceAgendaUids = items
      .map(getPathLeaves)
      .reduce((sourceAgendaUids, leaves) => sourceAgendaUids
        .concat(leaves.filter(uid => !sourceAgendaUids.includes(uid))), []);

    sourceAgendas = await config.interfaces.getSourceAgendas(sourceAgendaUids);
  }

  items.forEach(item => {
    if (members) {
      item.member = _.find(members, { userUid: item.userUid });
    }
    if (sourceAgendas) {
      item.sourceAgendas = getPathLeaves(item).map(uid => _.find(sourceAgendas, { uid }));
    }
  });
}
