import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import makeGetterLabel from 'labels';
import labels from 'labels/activities/user';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang
  })
)
export default class AgendaApp extends Component {

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang )
    };
  }

  render() {

    return (
      <div className="container activity-user top-margined">
        <div className="wsq">
          {this.props.children}
        </div>
      </div>
    );

  }

}