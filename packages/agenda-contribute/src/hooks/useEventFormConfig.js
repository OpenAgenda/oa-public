import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import cleanupSchemaForForm from '../lib/cleanupSchemaForForm';
import addStateField from '../lib/addStateField';
import injectAgendaUID from '../lib/injectAgendaUID';
import useDetailedAgenda from './useDetailedAgenda';
import useAgendaContext from './useAgendaContext';

export default function useEventFormConfig(agenda) {
  const {
    locale
  } = useIntl();

  const res = useSelector(state => state.res);
  const apiRoot = useSelector(state => state.settings.apiRoot);
  const files = useSelector(state => state.files);
  const tiles = useSelector(state => state.tiles);

  const {
    detailedAgendaIsLoading,
    detailedAgenda
  } = useDetailedAgenda(agenda.uid);

  const {
    agendaContextIsLoading,
    agendaContext
  } = useAgendaContext(agenda.uid);

  if (detailedAgendaIsLoading || agendaContextIsLoading) {
    return {
      isLoading: true
    };
  }

  cleanupSchemaForForm(detailedAgenda.schema, { locale });

  if (
    agendaContext?.me?.authorizations?.canChangeState
    && !detailedAgenda.schema.fields.find(f => f.field === 'state')
  ) {
    addStateField(detailedAgenda.schema, locale);
  }

  return {
    isLoading: false,
    schema: detailedAgenda.schema,
    agendaContext,
    detailedAgenda,
    config: {
      withErrors: false,
      unloadWarning: {
        router: true,
        page: true
      },
      lang: locale,
      schema: detailedAgenda.schema,
      locationRes: injectAgendaUID(res.locations, apiRoot, agenda.uid),
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
