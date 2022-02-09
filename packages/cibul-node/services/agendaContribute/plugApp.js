'use strict';

const isDraftRequested = require('./lib/isDraftRequested');
const defineFileKey = require('./lib/defineFileKey');
const createEvent = require('./middlewares/createEvent');
const loadEvent = require('./middlewares/loadEvent');
const updateEvent = require('./middlewares/updateEvent');
const addEvent = require('./middlewares/addEvent');
const mergeDataWithFiles = require('./middlewares/mergeDataWithFiles');
const getAgendaSchema = require('./middlewares/getAgendaSchema');
const loadMember = require('./middlewares/loadMember');
const verifyMemberAuthorization = require('./middlewares/verifyMemberAuthorization');

module.exports = (_config, services) => parentApp => {
  const {
    agendas,
    formSchemas: {
      middleware: {
        files: formSchemaFilesMw
      }
    }
  } = services;

  parentApp.post(
    '/:agendaSlug/contribute',
    isDraftRequested({ draft: true }),
    defineFileKey,
    agendas.mw.load,
    loadMember,
    verifyMemberAuthorization,
    getAgendaSchema,
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    createEvent
  );

  parentApp.post([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], [
    agendas.mw.load,
    loadMember,
    getAgendaSchema,
    loadEvent,
    verifyMemberAuthorization.edit,
    isDraftRequested({ draft: true }),
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    updateEvent
  ]);

  parentApp.post('/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid', [
    agendas.mw.load,
    loadMember,
    getAgendaSchema,
    agendas.mw.loadBy({
      path: 'params.fromAgendaUid',
      field: 'uid',
      target: 'fromAgenda'
    }),
    loadEvent,
    verifyMemberAuthorization.edit,
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    addEvent
  ]);
};
