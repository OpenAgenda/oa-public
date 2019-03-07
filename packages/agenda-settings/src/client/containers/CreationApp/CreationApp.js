import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaCreation';

@connect(
  state => ({
    lang: state.settings.lang
  })
)
export default class App extends Component {

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: label => makeGetterLabel( labels )( label, lang )
    };
  }

  render() {
    const { route } = this.props;
    // const { getLabel } = this.context;

    return (
      <div className="page">
        <div className="container agenda-settings-creation">
          {renderRoutes( route.routes )}
        </div>
      </div>
    );
  }

}
