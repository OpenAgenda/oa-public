'use strict';

const _ = require('lodash');

module.exports = (membersSvc, item) => ({
  name: _.get(item, 'custom.contactName', null),
  phone: _.get(item, 'custom.contactPhone', null),
  email: _.get(item, 'custom.email', null),
  position: _.get(item, 'custom.contactPosition', null),
  organization: _.get(item, 'custom.organization', null),
  role: membersSvc.utils.getRoleSlug(_.get(item, 'role'))
});
