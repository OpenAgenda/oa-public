'use strict';

const flatExports = require('@openagenda/flat-exports');
const fieldNameLabels = require('@openagenda/labels/event/exportFieldNames');
const memberLabels = require('@openagenda/labels/members');
const stateLabels = require('@openagenda/labels/event/states');

const csv = flatExports.csv();

module.exports = (req, res) => {
  csv(req.stream, {
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
    includeLanguages: req.query.includeLanguages,
    distributeOptionalFields: req.query.distributeOptionalFields
  }).pipe(res);

  return res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.csv"`
  });
};
