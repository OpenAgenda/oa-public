'use strict';

const flatExports = require('@openagenda/flat-exports');
const fieldNameLabels = require('@openagenda/labels/event/exportFieldNames');
const memberLabels = require('@openagenda/labels/members');

module.exports = () => (req, res) => {
  const options = {
    lang: req.lang,
    languages: req.languages?.length ? req.languages : [req.lang],
    labels: {
      ...fieldNameLabels,
      ...memberLabels
    },
    maintainedFields: ['dateRange', 'country'],
    formSchema: req.formSchema
  };

  const spreadsheetColumns = flatExports.csv().getHeaders(options);

  res.json({
    languages: req.languages,
    spreadsheetColumns
  });
};
