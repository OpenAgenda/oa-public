'use strict';

const _ = require('lodash');

module.exports = (membersSvc, item) => ({
  userUid: item?.userUid,
  name: _.get(item, 'custom.contactName', null),
  phone: _.get(item, 'custom.contactNumber', null),
  email: _.get(item, 'custom.email', null),
  position: _.get(item, 'custom.contactPosition', null),
  organization: _.get(item, 'custom.organization', null),
  role: membersSvc.utils.getRoleSlug(_.get(item, 'role'))
});

module.exports.custom = item => ({
  contactName: _.get(item, 'name', null),
  contactNumber: _.get(item, 'phone', null),
  email: _.get(item, 'email', null),
  contactPosition: _.get(item, 'position', null),
  organization: _.get(item, 'organization', null)
});
