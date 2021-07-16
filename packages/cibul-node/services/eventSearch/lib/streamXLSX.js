'use strict';

const flatExports = require('@openagenda/flat-exports');
const fieldNameLabels = require('@openagenda/labels/event/exportFieldNames');
const memberLabels = require('@openagenda/labels/members');

const xlsx = flatExports.xlsx();

module.exports = (req, res) => {
  xlsx(req.stream, {
    lang: req.lang,
    languages: req.languages,
    labels: {
      ...fieldNameLabels,
      ...memberLabels
    },
    maintainedFields: ['dateRange', 'country'],
    formSchema: req.formSchema
  }).pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.xlsx"`
  });
};
