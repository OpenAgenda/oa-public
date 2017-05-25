import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import makeGetterLabel from 'labels';
import labels from 'labels/home';
import classNames from 'classnames';
import Collapse from 'react-bootstrap/lib/Collapse';
import { Menu } from '../../components';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang,
    isNew: state.settings.isNew,
    prefix: state.settings.prefix,
    tab: state.menu.tab
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

    const { res, tab, isNew, prefix } = this.props;
    const { getLabel } = this.getChildContext();

    if ( isNew ) {
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