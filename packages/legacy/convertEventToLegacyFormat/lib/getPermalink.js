'use strict';

module.exports = ({ uid, root }, event) => `${root}/agendas/${uid}/events/${event.uid}`;
