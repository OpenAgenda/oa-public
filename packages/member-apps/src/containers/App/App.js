import { Component } from 'react';
import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import makeGetterLabel from '@openagenda/labels';
import { withLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import labels from '@openagenda/labels/members';
import I18nContext from '../../contexts/I18nContext';
import membersReducer from '../../reducers/members';
import modalsReducer from '../../reducers/modals';
import locales from '../../locales-compiled';

@withLayoutData('lang')
@provideHooks({
  inject: ({ store }) =>
    store.inject({
      members: membersReducer,
      modals: modalsReducer,
    }),
})
@connect(state => ({
  res: state.res,
}))
export default class App extends Component {
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
