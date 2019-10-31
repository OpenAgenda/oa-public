import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import classNames from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import I18nContext from '../contexts/I18nContext';
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
class App extends Component {
  getLabel = (label, values = {}) => makeGetterLabel(labels)(label, values, this.props.lang);

  i18nContextValue = {
    lang: this.props.lang,
    getLabel: this.getLabel
  };

  render() {
    const { route, tab, isNew, prefix, total } = this.props;

    const content = isNew && !total ? (
      <div className="container top-margined home">
        <div className="col-sm-8 col-sm-offset-2">
          <div className="row wsq">
            <div className="content">
              {renderRoutes(route.routes)}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className={classNames('container top-margined home', { [`home-${tab}`]: tab })}>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2">
            <ul className="home-nav list-inline">
              <MenuItem
                linkTo={prefix || '/'}
                active={tab === 'agendas'}
              >
                {this.getLabel('myAgendas')}
              </MenuItem>
              <MenuItem
                linkTo={prefix + '/events'}
                active={tab === 'events'}
              >
                {this.getLabel('myEvents')}
              </MenuItem>
            </ul>
            <div className="wsq">
              {renderRoutes(route.routes)}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        {content}
      </I18nContext.Provider>
    );
  }
}

export default module.hot ? hot(App) : App;
