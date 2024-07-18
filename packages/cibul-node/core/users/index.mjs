import { getForUserOnAgenda as getUserAuthorizationsOnAgenda } from '../utils/authorizations.mjs';
import listUserAgendas from './listUserAgendas.mjs';
import canEditEvent from './canEditEvent.mjs';
import getEventUserContext from './getEventUserContext.mjs';
import getAgendaUserContext from './getAgendaUserContext.mjs';
import userEventsSearch from './userEventsSearch.mjs';
import userDraftEvents from './userDraftEvents.mjs';
import get from './get.mjs';
import remove from './remove.mjs';
import generateToken from './generateToken.mjs';
import getByPublicKey from './getByPublicKey.mjs';

export default core =>
  Object.assign(
    identifier => ({
      remove: remove(core, identifier),
      agendas: Object.assign(
        agendaUid => ({
          getAuthorizations: getUserAuthorizationsOnAgenda.bind(
            null,
            core,
            identifier,
            agendaUid,
          ),
          getContext: (options = {}) =>
            getAgendaUserContext(core, identifier, agendaUid, options),
          events: Object.assign(
            eventOrUid => ({
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
      generateToken: generateToken.bind(null, core, identifier),
      canEditEvent: canEditEvent.bind(null, core, identifier),
    }),
    {
      get: Object.assign(get(core), {
        byAccessToken: (token, nonce) =>
          core.services.accessTokens.getUser(token, nonce),
        byPublicKey: key => getByPublicKey(core, key),
      }),
    },
  );
