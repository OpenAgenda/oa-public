'use strict';

module.exports = class NotFoundError extends Error {
  constructor(agendaUid, eventUid) {
    super('Not found');
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.objectName = 'agendaEvent';
    this.identifier = [agendaUid, eventUid].join('.');
  }
}
