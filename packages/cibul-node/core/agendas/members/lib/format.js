'use strict';

const _ = require('lodash');

const map = [{
  legacy: 'contactName',
  field: 'name'
}, {
  legacy: 'contactNumber',
  field: 'phone'
}, {
  legacy: 'email',
  field: 'email'
}, {
  legacy: 'contactPosition',
  field: 'position'
}, {
  legacy: 'organization',
  field: 'organization'
}];

module.exports = (membersSvc, item) => ({
  userUid: item?.userUid,
  name: _.get(item, 'custom.contactName', null),
  phone: _.get(item, 'custom.contactNumber', null),
  email: _.get(item, 'custom.email', null),
  position: _.get(item, 'custom.contactPosition', null),
  organization: _.get(item, 'custom.organization', null),
  role: membersSvc.utils.getRoleSlug(_.get(item, 'role')),
  updatedAt: item.updatedAt ?? null
});

module.exports.custom = item => map
  .filter(m => item[m.field] !== undefined)
  .reduce((carry, mapItem) => ({
    ...carry,
    [mapItem.legacy]: item[mapItem.field]
  }), {});
