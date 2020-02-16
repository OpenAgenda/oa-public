'use strict';

const VError = require( 'verror' );

module.exports = async (services, agendaUid) => {
  const agenda = await services.agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  });

  if (!agenda) {
    throw new VError( 'agenda of uid %d was not found', agendaUid );
  }

  return agenda;
}
