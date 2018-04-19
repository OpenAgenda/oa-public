"use strict";

// tests at test/format

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ = require('lodash'),
    slug = require('slug'),
    correspondance = [{
  db: 'review_id',
  obj: 'agendaId'
}, {
  db: 'user_id',
  obj: 'userId'
}, {
  db: 'id',
  obj: 'id'
}, {
  db: 'deleted_user',
  obj: 'deletedUser'
}, {
  db: 'credential',
  obj: 'credential'
}, {
  db: 'updated_at',
  obj: 'updatedAt'
}, {
  db: 'created_at',
  obj: 'createdAt'
}, {
  db: 'actions_counter',
  obj: 'actionsCounter'
}];

module.exports = {
  dbToObj: dbToObj,
  objToDb: objToDb
};

function objToDb(obj) {
  var filterNull = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


  var entry = {
    review_id: null,
    user_id: null,
    credential: null,
    store: null,
    organization: null,
    deleted_user: null,
    created_at: null,
    updated_at: null,
    actions_counter: null
  };

  correspondance.forEach(function (c) {

    entry[c.db] = obj[c.obj];
  });

  if (obj.custom) {

    var custom = _.mapKeys(obj.custom, function (v, k) {
      return _.snakeCase(k);
    });

    entry.store = JSON.stringify({
      custom_fields: custom
    });

    // legacy exception
    if (_typeof(obj.custom.organization) === 'object') {

      entry.organization = obj.custom.organization.slug;
    } else if (typeof obj.custom.organization === 'string') {

      entry.organization = slug(obj.custom.organization, { lower: true });
    }
  }

  if (obj.linkStore) {

    var store = entry.store ? JSON.parse(entry.store) : {};

    store.linkStore = obj.linkStore;

    entry.store = JSON.stringify(store);
  }

  if (filterNull) {

    var filtered = {};

    Object.keys(entry).forEach(function (k) {

      if (entry[k] !== null && entry[k] !== undefined) {

        filtered[k] = entry[k];
      }
    });

    return filtered;
  }

  if (entry.deleted_user === null || entry.deleted_user === undefined) {

    entry = _.omit(entry, ['deleted_user']);
  }

  if (entry.actions_counter === null || entry.actions_counter === undefined) {

    entry = _.omit(entry, ['actions_counter']);
  }

  return entry;
}

function dbToObj(entry) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  var obj = {
    id: null,
    agendaId: null,
    userId: null,
    credential: null,
    deletedUser: null,
    updatedAt: null,
    createdAt: null,
    custom: {}
  },
      store = {},
      params = _.extend({
    showSlugs: true
  }, options);

  if (!entry || (typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) !== 'object') {

    return obj;
  }

  correspondance.forEach(function (c) {

    obj[c.obj] = entry[c.db];
  });

  try {

    store = JSON.parse(entry.store || '{}');
  } catch (e) {}

  obj.linkStore = store.linkStore || null;

  if (store.custom_fields) {

    obj.custom = _.mapKeys(store.custom_fields, function (v, k) {
      return _.camelCase(k);
    });

    if (entry.organization && typeof obj.custom.organization === 'string') {

      _legacyDbToObj(entry, obj);
    }

    if (_typeof(obj.custom.organization) === 'object' && !params.showSlugs) {

      obj.custom.organization = obj.custom.organization.label;
    }
  }

  if (obj.actionsCounter === undefined) {

    obj = _.omit(obj, ['actionsCounter']);
  }

  if (obj.deletedUser === undefined) {

    obj = _.omit(obj, ['deletedUser']);
  } else {

    obj.deletedUser = !!obj.deletedUser;
  }

  return obj;
}

function _legacyDbToObj(entry, obj) {

  obj.custom.organization = {
    label: obj.custom.organization,
    slug: entry.organization
  };
}
//# sourceMappingURL=format.js.map