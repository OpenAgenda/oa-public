import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import useDetailedSchema from './useDetailedSchema';
import cleanupSchemaForForm from './cleanupSchemaForForm';

export default function useEventFormConfig(agenda) {
  const {
    locale
  } = useIntl();

  const res = useSelector(state => state.res);
  const files = useSelector(state => state.files);
  const tiles = useSelector(state => state.tiles);

  const {
    detailedSchemaIsLoading,
    detailedSchema: schema
  } = useDetailedSchema(agenda);

  if (detailedSchemaIsLoading) {
    return {
      configIsLoading: true
    };
  }

  cleanupSchemaForForm(schema, { locale });

  return {
    configIsLoading: false,
    config: {
      withErrors: false,
      lang: locale,
      schema,
      locationRes: res.locations,
      referencesRes: res.references,
      suggestionsRes: res.suggestions,
      maxFileSize: files.maxSize,
      fileStore: files.store,
      tiles,
      classNames: {
        fieldsCanvas: 'padding-all-md wsq padding-bottom-sm',
        bottomErrorsCanvas: 'error-summary padding-all-md',
      }
    }
  };
}
