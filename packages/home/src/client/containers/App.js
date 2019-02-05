import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { formValueSelector } from 'redux-form';
import classNames from 'classnames';
import qs from 'qs';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import MenuItem from '../components/MenuItem';
import * as agendasActions from '../redux/modules/agendas';

const selector = formValueSelector( 'homeAgendas' );

@provideHooks( {
  fetch: async ( { store: { dispatch, getState }, location } ) => {
    const state = getState();
    const query = qs.parse( location.search, { ignoreQueryPrefix: true } );
    const promises = [];

    if ( !agendasActions.isLoaded( 'homeAgendas', state ) ) {
      promises.push( dispatch( agendasActions.load( 'homeAgendas', query ) ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  state => ({
    agendasSearch: selector( state, 'search' ),
    res: state.res,
    lang: state.settings.lang,
    isNew: state.settings.isNew,
    prefix: state.settings.prefix,
    tab: state.menu.tab,
    total: state.agendas.homeAgendas && state.agendas.homeAgendas.total
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

    const { route, agendasSearch, tab, isNew, prefix, total } = this.props;
    const { getLabel } = this.getChildContext();

    if ( isNew && !total ) {
      return (
        <div className="container top-margined home">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="row wsq">
              <div className="content">
                {renderRoutes( route.routes )}
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
                linkTo={{ pathname: prefix || '/', search: qs.stringify( { search: agendasSearch || undefined } ) }}
                active={tab === 'agendas'}>
                {getLabel( 'myAgendas' )}
              </MenuItem>
              <MenuItem
                linkTo={prefix + '/events'}
                active={tab === 'events'}>
                {getLabel( 'myEvents' )}
              </MenuItem>
            </ul>
            <div className="wsq">
              {renderRoutes( route.routes )}
            </div>
          </div>
        </div>
      </div>
    );

  }

}
