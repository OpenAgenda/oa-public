import isDraftRequested from './lib/isDraftRequested.mjs';
import loadOrDefineFileKey from './lib/loadOrDefineFileKey.mjs';
import createEvent from './middlewares/createEvent.mjs';
import loadEvent from './middlewares/loadEvent.mjs';
import updateEvent from './middlewares/updateEvent.mjs';
import addEvent from './middlewares/addEvent.mjs';
import mergeDataWithFiles from './middlewares/mergeDataWithFiles.mjs';
import getAgendaSchema from './middlewares/getAgendaSchema.mjs';
import loadMember from './middlewares/loadMember.mjs';
import verifyMemberAuthorization, {
  edit as verifyMemberAuthorizationEdit,
} from './middlewares/verifyMemberAuthorization.mjs';
import addNewMember from './middlewares/addNewMember.mjs';

export default (_config, services) => parentApp => {
  const {
    agendas,
    formSchemas: {
      middleware: {
        files: formSchemaFilesMw,
      },
    },
  } = services;

  parentApp.post(
    '/:agendaSlug/contribute',
    isDraftRequested({ draft: true }),
    loadOrDefineFileKey,
    agendas.mw.load,
    loadMember,
    verifyMemberAuthorization,
    getAgendaSchema,
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    createEvent,
  );

  parentApp.post([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
  ], [
    agendas.mw.load,
    loadMember,
    getAgendaSchema,
    loadEvent,
    loadOrDefineFileKey,
    verifyMemberAuthorizationEdit,
    isDraftRequested({ draft: true }),
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    updateEvent,
  ]);

  parentApp.post('/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid', [
    agendas.mw.load,
    loadMember,
    getAgendaSchema,
    agendas.mw.loadBy({
      path: 'params.fromAgendaUid',
      field: 'uid',
      target: 'fromAgenda',
    }),
    loadEvent,
    loadOrDefineFileKey,
    verifyMemberAuthorizationEdit,
    addNewMember,
    formSchemaFilesMw.cleanFileValues.bind(null, {}),
    formSchemaFilesMw.putInTemporary.bind(null, {}),
    formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
    mergeDataWithFiles,
    addEvent,
  ]);
};
