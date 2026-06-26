import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import choice from '@openagenda/validators/choice';
import text from '@openagenda/validators/text';
import boolean from '@openagenda/validators/boolean';
import emailValidator from '@openagenda/validators/email';
import roles from '../iso/roles.js';

schema.register({
  integer,
  choice,
  text,
  boolean,
  email: emailValidator,
});

const validate = schema({
  id: {
    type: 'integer',
    list: {
      default: null,
    },
  },
  agendaUid: {
    type: 'integer',
    list: {
      default: null,
    },
  },
  userUid: {
    type: 'integer',
    list: {
      default: null,
    },
  },
  withUser: {
    type: 'boolean',
    default: null,
  },
  deletedUser: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  withActions: {
    type: 'boolean',
    default: null,
  },
  role: {
    type: 'choice',
    options: [
      'administrator',
      'moderator',
      'contributor',
      'reader',
      roles.ADMINISTRATOR,
      roles.MODERATOR,
      roles.CONTRIBUTOR,
      roles.READER,
    ],
  },
  search: {
    type: 'text',
    max: 255,
  },
  email: {
    // A tolerant search predicate, not a write validation: a blank or
    // malformed value must yield no match rather than throw, because the
    // supervisor lookup feeds it the (possibly wrong) email a visitor typed
    // into Crisp. Cleaned below before use.
    type: 'text',
    list: {
      default: null,
    },
  },
});

function _extractLegacyParts(query) {
  const legacyParts = {};

  if (_.get(query, 'credentials')) {
    legacyParts.role = _.get(query, 'credentials');
  }

  return legacyParts;
}

export default (k, query) => {
  const legacyParts = _extractLegacyParts(query);

  const {
    id,
    agendaUid,
    userUid,
    role,
    search,
    email,
    withUser,
    deletedUser,
    withActions,
  } = validate(
    Object.keys(legacyParts).length ? { ...query, ...legacyParts } : query,
  );

  // Drop blank/whitespace entries (and lowercase) so a stray `?email=` neither
  // crashes on a null element nor — on its own — authorizes an unscoped scan.
  const emails = (email ?? [])
    .map((e) => (e == null ? '' : String(e).trim().toLowerCase()))
    .filter(Boolean);

  // A non-empty `email` is a selective predicate, so it satisfies the scope
  // requirement on its own — a cross-agenda lookup the other scopes cannot do.
  if (!agendaUid && !userUid && !id && !emails.length) {
    throw new Error('neither agendaUid, userUid, id nor email are specified');
  }

  if (agendaUid && agendaUid.length === 1) {
    k.where('agenda_uid', agendaUid[0]);
  } else if (agendaUid) {
    k.whereIn('agenda_uid', agendaUid);
  }

  if (id) {
    k.whereIn('id', id);
  }

  if (userUid && userUid.length === 1) {
    k.where('user_uid', userUid[0]);
  } else if (userUid) {
    k.whereIn('user_uid', userUid);
  }

  if (withUser === true) {
    k.whereNotNull('user_uid');
  } else if (withUser === false) {
    k.whereNull('user_uid');
  }

  if (deletedUser === true) {
    k.where('deleted_user', true);
  } else if (deletedUser === false) {
    k.where('deleted_user', false);
  }

  if (withActions === true) {
    k.where('actions_counter', '>', 0);
  } else if (withActions === false) {
    k.where('actions_counter', '=', 0);
  }

  if (search) {
    k.andWhere('store', 'like', `%${search}%`);
  }

  // Match the legacy additional-info email at its JSON path (precise field
  // match, not a substring of the raw store blob). Accepts several addresses.
  if (emails.length) {
    const placeholders = emails.map(() => '?').join(', ');
    k.whereRaw(
      `LOWER(JSON_UNQUOTE(JSON_EXTRACT(\`store\`, '$.custom_fields.email'))) IN (${placeholders})`,
      emails,
    );
  }

  if (role.length) {
    k.whereIn(
      'credential',
      role.map((r) => (_.isInteger(r) ? r : roles[r.toUpperCase()])),
    );
  }
};
