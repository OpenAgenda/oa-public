'use strict';

const textLog = require('./textLog');
const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

let i = 0;

module.exports = ({
  baseSearchIncludes,
  detailedSearchIncludes
}, {
  detailed,
  formSchema
}) => {
  const includes = [].concat(detailed ? detailedSearchIncludes : baseSearchIncludes);

  return formSchema ? includes.concat(
    getFormSchemaAdditionalFields(formSchema).map(f => f.field)
  ) : includes;
}
