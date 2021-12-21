'use strict';

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

module.exports = async (core, identifier, agendaUid, options = {}) => {
  const member = await core
    .agendas(agendaUid).members
    .get(identifier, options);

  const authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid);

  return {
    me: {
      authorizations,
      member
    }
  };
};
