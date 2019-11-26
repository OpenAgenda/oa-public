import React, { Component } from 'react';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/members';
import I18nContext from '../../contexts/I18nContext';
import membersReducer from '../../reducers/members';
import modalsReducer from '../../reducers/modals';

@provideHooks({
  inject: ({ store }) => store.inject({
    members: membersReducer,
    modals: modalsReducer
  })
})
@connect(state => ({
  res: state.res,
  lang: state.settings.lang
}))
export default class App extends Component {
  i18nContextValue = {
    lang: this.props.lang,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, this.props.lang)
  };

  render() {
    const {
      route, agenda, member, role
    } = this.props;

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <div className="members-admin">
          {renderRoutes(route.routes, { agenda, member, role })}
        </div>
      </I18nContext.Provider>
    );
  }
}
