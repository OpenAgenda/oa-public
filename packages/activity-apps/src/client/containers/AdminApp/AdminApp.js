import React, { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/admin';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';

function AdminApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    labels,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <div className="activity-admin">
        {renderRoutes(route.routes)}
      </div>
    </I18nContext.Provider>
  );
}

export default AdminApp;

