import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withContext } from 'recompose';
import moment from 'moment';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';

import 'moment/locale/fr';

@connect(
  state => ({
    res: state.res,
    settings: state.settings
  })
)
@withContext(
  {
    lang: PropTypes.string,
    getLabel: PropTypes.func,
  },
  ( { settings } ) => ({
    lang: settings.lang,
    getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, settings.lang )
  })
)
export default class App extends Component {
  componentWillMount() {
    moment.locale( this.props.lang || 'fr' );
  }

  render() {
    const { settings: { Wrapper }, children } = this.props;

    if ( Wrapper ) {
      return (
        <Wrapper>
          {children}
        </Wrapper>
      );
    }

    return children;
  }
}
