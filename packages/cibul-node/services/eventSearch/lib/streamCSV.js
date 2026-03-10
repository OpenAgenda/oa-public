import { pipeline } from 'node:stream';
import * as flatExports from '@openagenda/flat-exports';
import fieldNameLabels from '@openagenda/labels/event/exportFieldNames.js';
import memberLabels from '@openagenda/labels/members/index.js';
import stateLabels from '@openagenda/labels/event/states.js';

const csv = flatExports.csv();

export default (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.csv"`,
  });

  const out = csv(req.stream, {
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
  });

  res.once('close', () => {
    if (!out.destroyed) out.destroy();
  });

  pipeline(out, res, () => {});
};
