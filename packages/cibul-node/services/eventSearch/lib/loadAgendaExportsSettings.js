import * as flatExports from '@openagenda/flat-exports';
import fieldNameLabels from '@openagenda/labels/event/exportFieldNames.js';
import memberLabels from '@openagenda/labels/members/index.js';

const CHOICE_FIELD_TYPES = ['radio', 'checkbox', 'select', 'multiselect'];

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

  const choiceFields = (req.formSchema?.fields ?? [])
    .filter(
      (f) =>
        f.schemaId != null
        && CHOICE_FIELD_TYPES.includes(f.fieldType)
        && f.options?.length > 0,
    )
    .map((f) => ({ field: f.field, label: f.label }));

  res.json({
    languages: req.languages,
    spreadsheetColumns,
    hasMultipleLocations: req.hasMultipleLocations ?? true,
    choiceFields,
  });
};
