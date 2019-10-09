import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import classNames from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import { MenuItem } from '../components';
import menuReducer from '../reducers/menu';
import agendasReducer from '../reducers/agendas';
import eventsReducer from '../reducers/events';
import modalsReducer from '../reducers/modals';

@provideHooks( {
  inject: ( { store } ) => store.inject( {
    menu: menuReducer,
    events: eventsReducer,
    agendas: agendasReducer,
    modals: modalsReducer
  } )
} )
@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang,
    isNew: state.settings.isNew,
    userUid: state.settings.userUid,
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

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: label => makeGetterLabel( labels )( label, lang )
    };
  }

  render() {

    const { route, tab, isNew, prefix, total } = this.props;
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
                linkTo={prefix || '/'}
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
