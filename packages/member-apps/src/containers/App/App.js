import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/members';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang
  })
)
export default class App extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  state = {
    menuOpen: false
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: (label, values = {}) => makeGetterLabel( labels )( label, values, lang )
    };
  }

  render() {
    const { route } = this.props;

    return (
      <div className="members-admin">
        {renderRoutes( route.routes )}
      </div>
    );
  }
}
