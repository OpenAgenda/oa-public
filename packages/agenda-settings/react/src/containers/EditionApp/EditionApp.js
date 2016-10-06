import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import makeGetterLabel from 'labels';
import labels from 'labels/agenda-settings/agendaEdition';
import * as agendaActions from '../../redux/modules/agenda';

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    if ( !agendaActions.isLoaded( getState() ) ) {
      return dispatch( agendaActions.load() );
    }
  }
} ] )
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
    return (
      <div className="agenda-settings-edit">
        {this.props.children}
      </div>
    );
  }

}