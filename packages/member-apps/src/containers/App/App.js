import { Component } from 'react';
import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import redial from 'redial';
import makeGetterLabel from '@openagenda/labels';
import { withLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import labels from '@openagenda/labels/members/index.js';
import I18nContext from '../../contexts/I18nContext.js';
import membersReducer from '../../reducers/members.js';
import modalsReducer from '../../reducers/modals.js';
import * as locales from '../../locales-compiled/index.js';

class App extends Component {
  i18nContextValue = {
    lang: this.props.lang,
    getLabel: (label, values = {}) =>
      makeGetterLabel(labels)(label, values, this.props.lang),
  };

  render() {
    const { route, lang } = this.props;

    return (
      <IntlProvider
        key={lang}
        locale={lang}
        // eslint-disable-next-line import/namespace
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <I18nContext.Provider value={this.i18nContextValue}>
          <div className="members-admin">{renderRoutes(route.routes)}</div>
        </I18nContext.Provider>
      </IntlProvider>
    );
  }
}

export default withLayoutData('lang')(
  redial.provideHooks({
    inject: ({ store }) =>
      store.inject({
        members: membersReducer,
        modals: modalsReducer,
      }),
  })(
    connect((state) => ({
      res: state.res,
    }))(App),
  ),
);
