import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import makeGetterLabel from 'labels';
import labels from 'labels/home/agendas';
import Collapse from 'react-bootstrap/lib/Collapse';

const selector = formValueSelector( 'homeDashboard' );

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang,
    agendas: state.agendas.data,
    search: selector( state, 'search' )
  })
)
export default class App extends Component {

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  constructor() {
    super();
    this.state = {
      menuOpen: false
    };
  }

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: label => makeGetterLabel( labels )( label, lang )
    };
  }

  render() {

    const { agendas, res, search, location: { query } } = this.props;
    const { getLabel } = this.getChildContext();
    const newUser = !search && !query.search && (!agendas || !agendas.length);

    if ( newUser ) {
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
      <div className="container top-margined home">
        <div className="row wsq">
          <div className="col-sm-3 col-sm-push-9">
            <div className="visible-xs-block"> {/* small screen version */}
              <div className="row header">
                <h2>{getLabel( 'myAgendas' )}</h2>
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
                    <ul className="list-unstyled">
                      <li className="menu-item">
                        <a href={res.new} className="btn btn-primary create-agenda">
                          {getLabel( 'createAgenda' )}
                        </a>
                      </li>
                      <li className="menu-item selected"><a>{getLabel( 'myAgendas' )}</a></li>
                      <li className="menu-item"><a href={res.events}>{getLabel( 'myEvents' )}</a></li>
                      <li className="menu-item"><a href={res.messages}>{getLabel( 'messages' )}</a></li>
                      <li className="menu-item"><a href={res.notifs}>{getLabel( 'notifications' )}</a></li>
                    </ul>
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="hidden-xs"> {/* large screen version */}
              <div className="row">
                <div className="nav nav-right">
                  <ul className="list-unstyled">
                    <li className="menu-item selected"><a>{getLabel( 'myAgendas' )}</a></li>
                    <li className="menu-item"><a href={res.events}>{getLabel( 'myEvents' )}</a></li>
                    <li className="menu-item"><a href={res.messages}>{getLabel( 'messages' )}</a></li>
                    <li className="menu-item"><a href={res.notifs}>{getLabel( 'notifications' )}</a></li>
                  </ul>
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