import React, { Component } from 'react';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/members';
import I18nContext from '../../contexts/I18nContext';

@connect(state => ({
  res: state.res,
  lang: state.settings.lang
}))
export default class App extends Component {
  constructor(props) {
    super(props);

    const { lang } = props;

    this.i18nContextValue = {
      lang,
      getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
    };
  }

  render() {
    const { route } = this.props;

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <div className="members-admin">{renderRoutes(route.routes)}</div>
      </I18nContext.Provider>
    );
  }
}
