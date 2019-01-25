import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/user';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang
  })
)
export default class AgendaApp extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    labels: PropTypes.object,
    getLabel: PropTypes.func
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      labels,
      getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang )
    };
  }

  render() {
    const { route } = this.props;

    return (
      <div className="container activity-user top-margined">
        <div className="wsq">
          {renderRoutes( route.routes )}
        </div>
      </div>
    );
  }
}
