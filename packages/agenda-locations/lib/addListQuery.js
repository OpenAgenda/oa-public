import { BadRequest } from '@openagenda/verror';
import date from '@openagenda/validators/date';
import schema from '@openagenda/validators/schema';
import integer from '@openagenda/validators/integer';
import text from '@openagenda/validators/text';
import boolean from '@openagenda/validators/boolean';

import tokenizeSearch from './tokenizeSearch.js';

schema.register({ integer, text, date, boolean });

const SEARCH_COLUMNS = ['placename', 'address', 'region', 'department', 'city'];

// Escape LIKE wildcards so a user-typed % or _ matches literally instead of
// acting as a wildcard (MySQL LIKE uses \ as its default escape character).
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

// A token matches if it is a substring of any searched column (OR within the
// token). The caller ANDs these together across tokens.
const whereTokenMatchesAnyColumn = (builder, token) => {
  const pattern = `%${escapeLike(token)}%`;
  SEARCH_COLUMNS.forEach((column, index) => {
    if (index === 0) {
      builder.where(column, 'like', pattern);
    } else {
      builder.orWhere(column, 'like', pattern);
    }
  });
};

const isNumber = (a) => typeof a === 'number';

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
  search: {
    type: 'text',
    sanitizeEncoding: 'utf8mb3',
    max: 255,
  },
  extId: {
    fields: {
      key: {
        type: 'text',
      },
      value: {
        type: 'text',
      },
    },
  },
  state: {
    type: 'integer',
    default: null,
  },
  updatedAt: ['gt', 'lt', 'gte', 'lte'].reduce(
    (updatedAt, op) => ({
      ...updatedAt,
      [op]: { type: 'date' },
    }),
    {},
  ),
  createdAt: ['gt', 'lt', 'gte', 'lte'].reduce(
    (createdAt, op) => ({
      ...createdAt,
      [op]: { type: 'date' },
    }),
    {},
  ),
  uids: {
    type: 'integer',
    list: {
      default: null,
    },
  },
  excludeUid: {
    type: 'integer',
    list: {
      default: null,
    },
  },
  geo: {
    fields: {
      northEast: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude',
          },
          lng: {
            type: 'longitude',
          },
        },
      },
      southWest: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude',
          },
          lng: {
            type: 'longitude',
          },
        },
      },
    },
  },
  hasNull: {
    type: 'text',
    list: {
      default: null,
    },
  },
  hasDuplicateCandidates: {
    type: 'boolean',
    default: null,
  },
});

const preCleanAndValidate = (query) => {
  const cleanQuery = { ...query };

  ['uids', 'excludeUid', 'hasNull'].forEach((param) => {
    if (query[param] && typeof query[param] === 'string') {
      cleanQuery[param] = query[param]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  });

  try {
    return validate(cleanQuery);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid parameters');
  }
};

export default async (service, k, deleted, query) => {
  const {
    agendaUid,
    setUid,
    search,
    extId,
    state,
    updatedAt,
    createdAt,
    uids,
    excludeUid,
    geo,
    hasNull,
    hasDuplicateCandidates,
  } = preCleanAndValidate(query);
  const agendaId = agendaUid
    ? await service.interfaces
      .getAgendaDetailsByUid(agendaUid, ['id'])
      .then((r) => (r ? r.id : null))
    : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  if (extId?.key && extId?.value) {
    k.whereRaw(
      "? MEMBER OF (ext_ids->'$.identifiers')",
      `${extId.key}->${extId.value}`,
    );
  }

  if (search) {
    const tokens = tokenizeSearch(search);

    if (tokens.length) {
      // Every token must match at least one column, so word order and
      // separators (spaces, hyphens, apostrophes) no longer matter:
      // "ville hôtel" now finds "Beffroi de l'Hôtel de Ville".
      tokens.forEach((token) => {
        k.where(function or() {
          whereTokenMatchesAnyColumn(this, token);
        });
      });
    } else {
      // No usable tokens (e.g. punctuation-only search): keep legacy behavior.
      k.where(function or() {
        whereTokenMatchesAnyColumn(this, search);
      });
    }
  }

  Object.keys(updatedAt)
    .filter((op) => !!updatedAt[op])
    .forEach((op) => {
      k.where(
        'updated_at',
        {
          gt: '>',
          gte: '>=',
          lt: '<',
          lte: '<=',
        }[op],
        updatedAt[op],
      );
    });

  Object.keys(createdAt)
    .filter((op) => !!createdAt[op])
    .forEach((op) => {
      k.where(
        'created_at',
        {
          gt: '>',
          gte: '>=',
          lt: '<',
          lte: '<=',
        }[op],
        createdAt[op],
      );
    });

  if (uids) {
    k.whereIn(
      'uid',
      uids.filter((uid) => !!uid),
    );
  }
  if (excludeUid) {
    k.whereNotIn('uid', excludeUid);
  }
  if (
    isNumber(geo?.northEast?.lat)
    && isNumber(geo?.northEast?.lng)
    && isNumber(geo?.southWest?.lat)
    && isNumber(geo?.southWest?.lng)
  ) {
    k.whereBetween('latitude', [geo.southWest.lat, geo.northEast.lat]);
    k.whereBetween('longitude', [geo.southWest.lng, geo.northEast.lng]);
  }
  if (state !== null) {
    k.where('store', 'like', `%"state":${state}%`);
  }
  if (deleted === true) {
    k.where('deleted', 1);
  }
  if (deleted === false) {
    k.where('deleted', '<>', 1);
  }
  if (hasDuplicateCandidates === true) {
    k.whereNotNull('duplicate_candidates');
  }
  if (hasNull) {
    const mapped = hasNull.map(
      (e) =>
        ({
          adminLevel1: 'region',
          adminLevel2: 'department',
          adminLevel3: 'admin_level_3',
          adminLevel4: 'city',
          adminLevel5: 'admin_level_5',
          adminLevel6: 'city_district',
          postalCode: 'postal_code',
        })[e] ?? e,
    );
    k.where(function or() {
      mapped.forEach((e) => this.orWhere(e, null));
    });
  }
};
