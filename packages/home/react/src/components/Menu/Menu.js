import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import classNames from 'classnames';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang,
    prefix: state.settings.prefix,
    tab: state.menu.tab
  })
)
export default class Menu extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  static defaultProps = {
    creationButton: true
  };

  render() {

    const { res, tab, prefix, creationButton } = this.props;
    const { getLabel } = this.context;

    return (
      <ul className="list-unstyled">
        {creationButton && <li className="menu-item">
          <a href={res.agendas.create} className="btn btn-primary create-agenda">
            {getLabel( 'createAgenda' )}
          </a>
        </li>}
        <li className={classNames( 'menu-item', { selected: tab === 'agendas' } )}>
          <Link to={prefix || '/'}>
            {getLabel( 'myAgendas' )}
          </Link>
        </li>
        <li className={classNames( 'menu-item', { selected: tab === 'events' } )}>
          <Link to={prefix + '/events'}>
            {getLabel( 'myEvents' )}
          </Link>
        </li>
        <li className="menu-item"><a href={res.messages}>{getLabel( 'messages' )}</a></li>
        <li className="menu-item"><a href={res.notifs}>{getLabel( 'notifications' )}</a></li>
      </ul>
    );

  }

}