import React, { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/user';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';

function UserApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    labels,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <div className="container activity-user top-margined">
        <div className="wsq">
          {renderRoutes(route.routes)}
        </div>
      </div>
    </I18nContext.Provider>
  );
}

export default UserApp;
