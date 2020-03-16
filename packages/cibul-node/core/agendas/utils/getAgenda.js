'use strict';

const NotFoundError = require('../../utils/NotFoundError');

module.exports = async (services, agendaUid) => {
  const agenda = await services.agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  });

  if (!agenda) {
    throw new NotFoundError('agenda', agendaUid);
  }

  return agenda;
}
