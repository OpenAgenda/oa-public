'use strict';

module.exports = (services, networkUid) => services.agendas.list({
  networkUid
}, 0, 1000).then(r => r.agendas);
