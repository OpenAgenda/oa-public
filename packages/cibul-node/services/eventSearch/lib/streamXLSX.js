import { pipeline } from 'node:stream';
import logs from '@openagenda/logs';
import * as flatExports from '@openagenda/flat-exports';
import fieldNameLabels from '@openagenda/labels/event/exportFieldNames.js';
import memberLabels from '@openagenda/labels/members/index.js';
import stateLabels from '@openagenda/labels/event/states.js';

const xlsx = flatExports.xlsx();

const log = logs('services/eventSearch/streamXlsx');

export default (req, res) => {
  const out = xlsx(req.stream, {
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

  pipeline(out, res, (err) => {
    if (err) {
      log.error(err);
      res.destroy();
    }
  });

  res.writeHead(200, {
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.xlsx"`,
  });
};
