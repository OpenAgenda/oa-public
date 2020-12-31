'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  },
  locationUid: {
    type: 'integer'
  },
  uid: {
    type: 'integer',
    list: {
      default: null
    }
  }
});

module.exports = (k, query, options = {}) => {
  const {
    agendaUid,
    locationUid,
    uid
  } = validate(query);

  const {
    private: privateOption,
    draft
  } = options;

  if (agendaUid) {
    k.where('agenda_uid', agendaUid);
  }

  if (locationUid) {
    k.where('location_uid', locationUid);
  }

  if (uid) {
    k.whereIn('uid', uid);
  }

  if (privateOption !== null) {
    k.where('private', privateOption);
  }

  if (draft !== null) {
    k.where('draft', draft);
  }
}