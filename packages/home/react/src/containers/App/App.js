import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/home';
import classNames from 'classnames';
import Collapse from 'react-bootstrap/lib/Collapse';
import { Menu } from '../../components';
import * as agendasActions from '../../redux/modules/agendas';

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

    const { res, tab, isNew, prefix, total } = this.props;
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
        <div className="row wsq">
          <div className="col-sm-3 col-sm-push-9">
            <div className="visible-xs-block"> {/* small screen version */}
              <div className="row header">
                <h2>{getLabel( 'my' + ucfirst( tab ) )}</h2>
                <div className="pull-right">
                  <button className="btn btn-default btn-collapse-nav" type="button"
                    onClick={() => this.setState( { menuOpen: !this.state.menuOpen } )}
                  >
                    <i className="fa fa-bars" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Collapse in={this.state.menuOpen}>
                <div className="row">
                  <div className="nav">
                    <Menu />
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="hidden-xs"> {/* large screen version */}
              <div className="row">
                <div className="nav nav-right">
                  <Menu creationButton={false} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-9 col-sm-pull-3 content">
            {this.props.children}
          </div>
        </div>
      </div>
    );

  }

}