"use strict";

import { asyncConnect } from 'redux-connect';
import classNames from 'classnames';
import Collapse from 'react-bootstrap/lib/Collapse';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import MenuItem from '../../components/MenuItem';
import * as agendasActions from '../../redux/modules/agendas';

const selector = formValueSelector( 'homeAgendas' );

const ucfirst = txt => txt.charAt( 0 ).toUpperCase() + txt.slice( 1 );

@asyncConnect( [ {
  deferred: !__CLIENT__,
  promise: ( { store: { dispatch, getState } } ) => {
    const state = getState();
    const query = state.routing.locationBeforeTransitions.query;
    const promises = [];

    if ( !agendasActions.isLoaded( 'homeAgendas', state ) ) {
      promises.push( dispatch( agendasActions.load( 'homeAgendas', query ) ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} ] )
@connect(
  state => ({
    agendasSearch: selector( state, 'search' ),
    res: state.res,
    lang: state.settings.lang,
    isNew: state.settings.isNew,
    prefix: state.settings.prefix,
    tab: state.menu.tab,
    total: state.agendas.homeAgendas.total
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
      getLabel: label => makeGetterLabel( labels )( label, lang )
    };
  }

  render() {

    const { agendasSearch, res, tab, isNew, prefix, total } = this.props;
    const { getLabel } = this.getChildContext();

    if ( isNew && !total ) {
      return (
        <div className="container top-margined home">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="row wsq">
              <div className="content">
                {this.props.children}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={classNames( 'container top-margined home', { [ `home-${tab}` ]: tab } )}>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2">
            <ul className="home-nav list-inline">
              <MenuItem 
                linkTo={{ pathname: prefix || '/', query: { search: agendasSearch || undefined } }}
                active={tab === 'agendas'}>
                {getLabel( 'myAgendas' )}
              </MenuItem>
              <MenuItem
                linkTo={prefix + '/events'}
                active={tab === 'events'}>
                {getLabel( 'myEvents' )}
              </MenuItem>
            </ul>
            <div className="wsq content">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
    
  }

}