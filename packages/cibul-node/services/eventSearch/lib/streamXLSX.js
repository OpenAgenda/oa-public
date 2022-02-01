'use strict';

const flatExports = require('@openagenda/flat-exports');
const fieldNameLabels = require('@openagenda/labels/event/exportFieldNames');
const memberLabels = require('@openagenda/labels/members');
const stateLabels = require('@openagenda/labels/event/states');

const xlsx = flatExports.xlsx();

module.exports = (req, res) => {
  xlsx(req.stream, {
    agendaUid: req.agenda.uid,
    lang: req.lang,
    languages: req.languages,
    labels: {
      ...fieldNameLabels,
      ...memberLabels,
      ...stateLabels
    },
    maintainedFields: ['dateRange', 'country'],
    formSchema: req.formSchema,
    includeFields: req.query.includeFields,
    includeLanguages: req.query.includeLanguages
  }).pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.xlsx"`
  });
};
