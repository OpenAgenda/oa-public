import React, { useMemo } from 'react';
import { provideHooks } from 'redial';
import { renderRoutes } from 'react-router-config';
import { reducer as formReducer } from 'redux-form';
import { useLayoutData } from '@openagenda/react-shared';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/agenda';
import modalsReducer from '../../redux/modules/modals';
import activitiesReducer from '../../redux/modules/activities';
import I18nContext from '../../contexts/I18nContext';

function AgendaApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    labels,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <div className="activity-agenda-admin">
        {renderRoutes(route.routes)}
      </div>
    </I18nContext.Provider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer,
    modals: modalsReducer,
    activities: activitiesReducer
  })
})(AgendaApp);
