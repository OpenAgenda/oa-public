'use strict';

const date = require('@openagenda/validators/date');
const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');

schema.register({ integer, text, date });

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
  search: {
    type: 'text',
    max: 255,
  },
  state: {
    type: 'integer',
    default: null,
  },
  updatedAt: ['gt', 'lt', 'gte', 'lte'].reduce((updatedAt, op) => ({
    ...updatedAt,
    [op]: { type: 'date' }
  }), {}),
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
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      },
      southWest: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      }
    }
  },
});

module.exports = async (service, k, deleted, query) => {
  const {
    agendaUid, setUid, search, state, updatedAt, uids, excludeUid, geo
  } = validate(query);

  const agendaId = agendaUid
    ? await service.interfaces
      .getAgendaDetailsByUid(agendaUid, ['id'])
      .then(r => (r ? r.id : null))
    : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  if (search) {
    k.where(function or() {
      this.where('placename', 'like', `%${search}%`)
        .orWhere('address', 'like', `%${search}%`)
        .orWhere('region', 'like', `%${search}%`)
        .orWhere('department', 'like', `%${search}%`)
        .orWhere('city', 'like', `%${search}%`);
    });
  }

  Object.keys(updatedAt)
    .filter(op => !!updatedAt[op])
    .forEach(op => {
      k.where('updated_at', ({
        gt: '>', gte: '>=', lt: '<', lte: '<='
      })[op], updatedAt[op]);
    });

  if (uids) {
    k.whereIn('uid', uids.filter(uid => !!uid));
  }
  if (excludeUid) {
    k.whereNotIn('uid', excludeUid);
  }
  if (geo?.northEast?.lat && geo?.northEast?.lng && geo?.southWest?.lat && geo?.southWest?.lng) {
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
};
