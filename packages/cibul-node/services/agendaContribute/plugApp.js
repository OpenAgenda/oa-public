import isDraftRequested from './lib/isDraftRequested.js';
import createEvent from './middlewares/createEvent.js';
import loadEvent from './middlewares/loadEvent.js';
import updateEvent from './middlewares/updateEvent.js';
import addEvent from './middlewares/addEvent.js';
import mergeDataWithFiles from './middlewares/mergeDataWithFiles.js';
import getAgendaSchema from './middlewares/getAgendaSchema.js';
import loadMember from './middlewares/loadMember.js';
import verifyMemberAuthorization, {
  edit as verifyMemberAuthorizationEdit,
} from './middlewares/verifyMemberAuthorization.js';
import addNewMember from './middlewares/addNewMember.js';

export default (_config, services) => (parentApp) => {
  const {
    agendas,
    formSchemas: {
      middleware: { files: formSchemaFilesMw },
    },
  } = services;

  parentApp.post(
    '/:agendaSlug/contribute',
    isDraftRequested({ draft: true }),
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

  parentApp.post(
    [
      '/:agendaSlug/contribute/event/:eventUid',
      '/:agendaSlug/contribute/event/:eventUid/draft',
    ],
    [
      agendas.mw.load,
      loadMember,
      getAgendaSchema,
      loadEvent,
      verifyMemberAuthorizationEdit,
      isDraftRequested({ draft: true }),
      formSchemaFilesMw.cleanFileValues.bind(null, {}),
      formSchemaFilesMw.putInTemporary.bind(null, {}),
      formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
      mergeDataWithFiles,
      updateEvent,
    ],
  );

  parentApp.post(
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid',
    [
      agendas.mw.load,
      loadMember,
      getAgendaSchema,
      agendas.mw.loadBy({
        path: 'params.fromAgendaUid',
        field: 'uid',
        target: 'fromAgenda',
      }),
      loadEvent,
      verifyMemberAuthorizationEdit,
      addNewMember,
      formSchemaFilesMw.cleanFileValues.bind(null, {}),
      formSchemaFilesMw.putInTemporary.bind(null, {}),
      formSchemaFilesMw.uploadFilesToS3.bind(null, { ignore: ['image'] }),
      mergeDataWithFiles,
      addEvent,
    ],
  );
};
