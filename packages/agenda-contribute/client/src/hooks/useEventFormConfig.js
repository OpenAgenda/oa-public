import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import cleanupSchemaForForm from '../lib/cleanupSchemaForForm';
import injectAgendaUID from '../lib/injectAgendaUID';
import useDetailedAgenda from './useDetailedAgenda';

export default function useEventFormConfig(agenda) {
  const {
    locale
  } = useIntl();

  const res = useSelector(state => state.res);
  const APIRoot = useSelector(state => state.APIRoot);
  const files = useSelector(state => state.files);
  const tiles = useSelector(state => state.tiles);

  const {
    detailedAgendaIsLoading,
    detailedAgenda
  } = useDetailedAgenda(agenda.uid);

  if (detailedAgendaIsLoading) {
    return {
      configIsLoading: true
    };
  }

  cleanupSchemaForForm(detailedAgenda.schema, { locale });

  return {
    configIsLoading: false,
    schema: detailedAgenda.schema,
    config: {
      withErrors: false,
      lang: locale,
      schema: detailedAgenda.schema,
      locationRes: injectAgendaUID(res.locations, APIRoot, agenda.uid),
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
