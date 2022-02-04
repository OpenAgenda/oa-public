import _ from 'lodash';

export default function extractLanguages(formSchema = null, values, options = {}) {
  const {
    defaultLanguage = 'en'
  } = options;

  const fields = formSchema ? formSchema.fields : null;

  const requiredLanguages = (fields ?? []).find(f => f.field === 'languages')?.required ?? [];

  const multilingualFields = fields ? fields.filter(f => !!f.languages).map(f => f.field) : ['title', 'description', 'longDescription', 'keywords', 'conditions'];

  const languages = multilingualFields.reduce((languages, fieldName) => {
    const fieldValue = values?.[fieldName];

    if (!fieldValue || !(fieldValue instanceof Object) || Array.isArray(fieldValue)) {
      return languages;
    }

    return languages.concat(
      Object.keys(fieldValue).filter(l => !languages.includes(l))
    );
  }, requiredLanguages);

  return languages.length ? languages : [defaultLanguage];
}