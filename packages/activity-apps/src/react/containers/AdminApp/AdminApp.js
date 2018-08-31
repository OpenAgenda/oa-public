import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/admin';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang
  })
)
export default class AdminApp extends Component {

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

    return (
      <div className="activity-admin">
        {this.props.children}
      </div>
    );

  }

}
