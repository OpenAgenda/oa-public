'use strict';

const _ = require('lodash');

const invitations = require('@openagenda/invitations');
const log = require('@openagenda/logs')('services/invitations');

async function linkMember(services, { user }, [member, context]) {
  const {
    members,
  } = services;

  log('linking', user, member, context);

  const currentMember = await members.get(member.id);

  if (!currentMember) throw new Error('Member not found');

  const customData = _.set(
    currentMember.custom,
    'contactName',
    currentMember?.custom?.contactName ?? user.fullName,
  );

  return members.patch(member.id, {
    userUid: user.uid,
    custom: customData,
  }, {
    context,
    requireCustom: false,
  });
}

module.exports.init = (config, services) => {
  invitations.init({
    mysql: config.db,
    schemas: config.schemas,
    interfaces: {
      onAssign: (action, invitation, cb) => cb(null),
    },
    actions: {
      linkMember: (executeData, actionParams, cb) => {
        linkMember(services, executeData, actionParams).then(() => cb(), cb);
      },
    },
  });

  return invitations;
};
