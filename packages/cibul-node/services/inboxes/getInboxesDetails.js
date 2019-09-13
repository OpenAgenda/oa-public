'use strict';

const wn = require('when/node');
const agendasSvc = require('@openagenda/agendas');
const config = require('../../config');
const getUsersDetails = require('./getUsersDetails');

module.exports = async function getInboxesDetails(inboxesToBeDetailed) {
    const usersToBeDetailed = inboxesToBeDetailed
      .filter(v => v.type === 'user')
      .map(v => ({ userUid: v.identifier }));
    const agendasToBeDetailed = inboxesToBeDetailed.filter(v => v.type === 'agenda');
    const supportToBeDetailed = inboxesToBeDetailed.filter(v => v.type === 'support');

    const users = await getUsersDetails(usersToBeDetailed);
    const agendas = agendasToBeDetailed.length === 0 ? [] : (await wn.call(
      agendasSvc.list,
      { uid: agendasToBeDetailed.map(v => v.identifier) },
      {
        private: null,
        includeImagePath: true,
        useDefaultImage: true
      }
    ))[0].map(v => ({
      uid: v.uid,
      name: v.title,
      avatar: v.image || config.aws.defaultImagePath
    }));
    const supports = supportToBeDetailed.map(v => ({
      ...v,
      uid: 1,
      name: 'Support - OpenAgenda',
      avatar: config.aws.oaLogoIcon
    }));

    return [...users, ...agendas, ...supports];
  };
