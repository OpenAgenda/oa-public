'use strict';

const _ = require('lodash');

const membersSvc = require('../members');

module.exports = (aes = []) => membersSvc.list({
  agendaUid: _.first(aes,'0.agendaUid'),
  userUid: aes.map(ae => ae.userUid).filter(userUid => !!userUid)
});
