import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import makeGetterLabel from 'labels';
const labels = {}; // TODO import labels
import Collapse from 'react-bootstrap/lib/Collapse';

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

    return (
      <div className="container top-margined home">
        <div className="row wsq">
          <div className="col-sm-3 col-sm-push-9">
            <div className="row content visible-xs-block"> {/* small screen version */}
              <h2>Mes agendas</h2>
              <div className="pull-right">
                <button className="btn btn-default btn-collapse-nav" type="button"
                        onClick={() => this.setState( { menuOpen: !this.state.menuOpen } )}
                >
                  <i className="fa fa-bars" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="row hidden-xs"> {/* large screen version */}
              <button className="btn btn-success center-block margin-v-md create-agenda" type="button">
                Créer un agenda
              </button>
            </div>
            <div className="visible-xs-block"> {/* small screen version */}
              <Collapse in={this.state.menuOpen}>
                <div className="row">
                  <div className="nav">
                    <ul className="list-unstyled">
                      <li className="menu-item">
                        <button className="btn btn-success create-agenda" type="button">
                          Créer un agenda
                        </button>
                      </li>
                      <li className="menu-item selected"><a href="#">Mes agendas</a></li>
                      <li className="menu-item"><a href="#">Mes événements</a></li>
                      <li className="menu-item"><a href="#">Messages</a></li>
                      <li className="menu-item"><a href="#">Notifications</a></li>
                    </ul>
                  </div>
                </div>
              </Collapse>
            </div>
            <div className="hidden-xs"> {/* large screen version */}
              <div className="row collapse in" id="collapseNav">
                <div className="nav nav-right">
                  <ul className="list-unstyled">
                    <li className="menu-item selected"><a href="#">Mes agendas</a></li>
                    <li className="menu-item"><a href="#">Mes événements</a></li>
                    <li className="menu-item"><a href="#">Messages</a></li>
                    <li className="menu-item"><a href="#">Notifications</a></li>
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