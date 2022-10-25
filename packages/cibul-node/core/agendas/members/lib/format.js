'use strict';

const map = [{
  legacy: 'contactName',
  field: 'name',
}, {
  legacy: 'contactNumber',
  field: 'phone',
}, {
  legacy: 'email',
  field: 'email',
}, {
  legacy: 'contactPosition',
  field: 'position',
}, {
  legacy: 'organization',
  field: 'organization',
}];

module.exports = (membersSvc, item, options) => {
  const { detailed = false } = options;
  const result = {
    userUid: item?.userUid,
    deletedUser: item?.deletedUser ?? null,
    name: item?.custom?.contactName ?? null,
    phone: item?.custom?.contactNumber ?? null,
    email: item?.custom?.email ?? null,
    position: item?.custom?.contactPosition ?? null,
    organization: item?.custom?.organization ?? null,
    role: membersSvc.utils.getRoleSlug(item?.role),
    updatedAt: item.updatedAt ?? null,
  };
  if (!detailed) return result;
  return {
    ...result,
    eventCount: item?.eventCount ?? null,
    invited: item?.invited ?? null,
  };
};

module.exports.custom = item => map
  .filter(m => item[m.field] !== undefined)
  .reduce((carry, mapItem) => ({
    ...carry,
    [mapItem.legacy]: item[mapItem.field],
  }), {});
