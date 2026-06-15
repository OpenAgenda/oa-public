import { BadRequest } from '@openagenda/verror';

export default async (core, networkUid, agendaUid, options = {}) => {
  const { credentials, official } = options;

  await core.networks(networkUid).get({ throwNotFound: true });

  const agenda = await core.agendas(agendaUid).get({
    private: null,
    throwNotFound: true,
    access: 'internal',
  });

  if (agenda.networkUid === networkUid) {
    throw new BadRequest('agenda is already in the network');
  } else if (agenda.networkUid) {
    throw new BadRequest('agenda is already in a network');
  }

  const update = { networkUid };

  if (typeof official === 'boolean') {
    update.official = official;
  }

  // Only write `credentials` when it's a non-empty plain object. The client may
  // omit it or send `{}` when no feature was toggled, and a non-object (a
  // malformed body) must never reach the update path.
  if (
    credentials
    && typeof credentials === 'object'
    && !Array.isArray(credentials)
    && Object.keys(credentials).length
  ) {
    update.credentials = credentials;
  }

  // `credentials`/`official` are internal/protected fields, so mirror the options
  // used by the superadmin agenda update path to allow writing them.
  const updated = await core.agendas(agenda).update(update, {
    access: 'internal',
    internal: true,
    protected: false,
  });

  // `core.agendas().update()` swallows validation errors and returns the
  // unchanged agenda, so a merged-document validation failure would otherwise
  // look like a successful add (HTTP 200) while nothing was persisted. The
  // networkUid not landing is the signal that the write did not go through.
  if (updated.networkUid !== networkUid) {
    throw new BadRequest('could not add agenda to the network');
  }

  return updated;
};
