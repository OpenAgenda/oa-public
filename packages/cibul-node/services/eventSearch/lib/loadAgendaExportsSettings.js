import * as flatExports from '@openagenda/flat-exports';
import fieldNameLabels from '@openagenda/labels/event/exportFieldNames.js';
import memberLabels from '@openagenda/labels/members/index.js';

export default () => (req, res) => {
  const options = {
    lang: req.lang,
    languages: req.languages?.length ? req.languages : [req.lang],
    labels: {
      ...fieldNameLabels,
      ...memberLabels,
    },
    maintainedFields: ['dateRange', 'country'],
    formSchema: req.formSchema,
  };

  const spreadsheetColumns = flatExports.csv().getHeaders(options);

  res.json({
    languages: req.languages,
    spreadsheetColumns,
  });
};
