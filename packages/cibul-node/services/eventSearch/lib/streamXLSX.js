import flatExports from '@openagenda/flat-exports';
import fieldNameLabels from '@openagenda/labels/event/exportFieldNames.js';
import memberLabels from '@openagenda/labels/members/index.js';
import stateLabels from '@openagenda/labels/event/states.js';

const xlsx = flatExports.xlsx();

export default (req, res) => {
  xlsx(req.stream, {
    agendaUid: req.agenda.uid,
    lang: req.lang,
    languages: req.languages,
    labels: {
      ...fieldNameLabels,
      ...memberLabels,
      ...stateLabels,
    },
    maintainedFields: ['dateRange', 'country'],
    formSchema: req.formSchema,
    includeFields: req.query.includeFields,
    includeLanguages: req.query.includeLanguages,
    spreadFields: req.query.distributeOptionalFields,
  }).pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.xlsx"`,
  });
};
