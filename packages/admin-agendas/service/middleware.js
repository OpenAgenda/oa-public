import _ from 'lodash';
import validators from '@openagenda/validators';

let service;
let config;
let agendas;

export default {
  init,
  agendas: {
    set,
  },
  members: {
    list: membersList,
  },
};

function init(s, c) {
  service = s;

  config = Object.assign(
    {
      limit: {
        default: 20,
        max: 100,
      },
    },
    c.mw || {},
    _.pick(c, 'interfaces'),
  );

  agendas = c.services.agendas;
}

function _extendWithConfig(agenda) {
  const credsConfig = config.interfaces.getAgendaCredentialDetails();

  const defaultCreds = Object.entries(credsConfig).reduce(
    (accu, [key, value]) => ({
      ...accu,
      [key]: value.default,
    }),
    {},
  );

  return {
    ...agenda,
    credentials: {
      ...defaultCreds,
      ...agenda.credentials,
    },
    config: {
      credentials: credsConfig,
    },
  };
}

function set(req, res, next) {
  // bad practice to call a service inside another service
  agendas.set(
    { uid: req.params.uid },
    req.body,
    {
      internal: true,
      protected: false,
      private: null,
      context: req.context || null,
    },
    (err, result) => {
      if (err) return next(err);

      result.agenda = _extendWithConfig(result.agenda);

      next();
    },
  );
}

async function membersList(req, res, next) {
  let agendaUid = parseInt(req.query.agendaUid, 10),
    offset = 0,
    limit = config.limit.default,
    page = 1;

  try {
    page = validators.number({
      min: 1,
      default: 1,
    })(req.query.membersPage);

    offset = (page - 1) * limit;
  } catch (e) {}

  // bad practice to call a service inside another service
  try {
    const { total, members } = await service.members.list(
      {
        agendaUid,
        deletedUser: null,
      },
      { order: 'role.desc', offset, limit },
      { total: true, detailed: true, userOptions: { detailed: true } },
    );

    res.json({
      members,
      total,
    });
  } catch (e) {
    return next(e);
  }
}
