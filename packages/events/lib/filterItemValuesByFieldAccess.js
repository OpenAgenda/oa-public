'use strict';

const fields = require('./fields');

module.exports = (item, options) => (
  options.additionalFields.length ? fields.concat(options.additionalFields.map(f => ({ field: f }))) : fields
).filter(field => ( // filter by excludeFields when specified
  options.excludeFields.length ? !options.excludeFields.includes(field.field) : true
) && ( // filter by access
  field.read ? field.read.includes(options.access || 'public') : true
) && ( // filter by includeFields when specified
  options.includeFields.length ? options.includeFields.includes(field.field) : true
)).reduce((filtered, field) => ({
  ...filtered,
  [field.field]: item[field.field]
}), {});
