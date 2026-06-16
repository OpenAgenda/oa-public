import { getForUserOnAgenda as getUserAuthorizationsOnAgenda } from '../utils/authorizations.js';
import listUserAgendas from './listUserAgendas.js';
import canEditEvent from './canEditEvent.js';
import getEventUserContext from './getEventUserContext.js';
import getAgendaUserContext from './getAgendaUserContext.js';
import userEventsSearch from './userEventsSearch.js';
import userDraftEvents from './userDraftEvents.js';
import get from './get.js';
import remove from './remove.js';
import soleAdminAgendas from './soleAdminAgendas.js';
import generateToken from './generateToken.js';

export default (core) =>
  Object.assign(
    (identifier) => ({
      remove: remove(core, identifier),
      agendas: Object.assign(
        (agendaUid) => ({
          getAuthorizations: getUserAuthorizationsOnAgenda.bind(
            null,
            core,
            identifier,
            agendaUid,
          ),
          getContext: (options = {}) =>
            getAgendaUserContext(core, identifier, agendaUid, options),
          events: Object.assign(
            (eventOrUid) => ({
              getContext: (options = {}) =>
                getEventUserContext(
                  core,
                  identifier,
                  agendaUid,
                  eventOrUid,
                  options,
                ),
            }),
            {
              search: userEventsSearch.bind(null, core, identifier, agendaUid),
              drafts: userDraftEvents.bind(null, core, identifier, agendaUid),
            },
          ),
        }),
        {
          list: listUserAgendas(core, identifier),
        },
      ),
      soleAdminAgendas: soleAdminAgendas(core, identifier),
      generateToken: generateToken.bind(null, core, identifier),
      canEditEvent: canEditEvent.bind(null, core, identifier),
    }),
    {
      get: Object.assign(get(core), {
        byAccessToken: (token) => core.services.accessTokens.getUser(token),
      }),
    },
  );
