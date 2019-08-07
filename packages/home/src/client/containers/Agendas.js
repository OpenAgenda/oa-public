import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import qs from 'qs';
import Spinner from '@openagenda/react-components/build/Spinner';
import { setTab } from '../redux/modules/menu';
import { Welcome } from '../components';
import AgendasSearch from './AgendasSearch';

@provideHooks( {
  fetch: ( { store: { dispatch } } ) => dispatch( setTab( 'agendas' ) )
} )
@connect( ( state, props ) => ({
  query: qs.parse( props.location.search, { ignoreQueryPrefix: true } ),
  res: state.res,
  isNew: state.settings.isNew,
  loading: state.agendas.homeAgendas ? state.agendas.homeAgendas.loading : true,
  total: state.agendas.homeAgendas && state.agendas.homeAgendas.total
}) )
@withRouter
export default class Agendas extends Component {

  constructor( props ) {
    super( props );
    this.renderHeader = ::this.renderHeader;
    this.renderAgendaActions = ::this.renderAgendaActions;
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderHeader() {
    const { res } = this.props;
    const { getLabel } = this.context;

    return (
      <div className="header">
        <div className="hidden-xs pull-right">
          <Link to={res.agendas.create} className="btn btn-primary" type="button">
            {getLabel( 'createAgenda' )}
          </Link>
        </div>
      </div>
    );
  }

  renderAgendaActions( { agenda } ) {
    const { res } = this.props;
    const { getLabel } = this.context;

    return (
      <div className="actions">
        {[ 4 ].includes( agenda.stakeholder.credential ) && <a
          href={res.agendas[ agenda.private ? 'showPrivate' : 'show' ].replace( ':slug', agenda.slug )}
        >
          {getLabel( 'see' )}
        </a>}
        {[ 2, 3 ].includes( agenda.stakeholder.credential ) && <a
          href={res.agendas.moderate.replace( ':slug', agenda.slug )}
        >
          {agenda.stakeholder.credential === 2 ? getLabel( 'manage' ) : getLabel( 'moderate' )}
        </a>}
        {[ 1, 2, 3 ].includes( agenda.stakeholder.credential ) && (
          <a
            href={(agenda.useContributeApp ? res.agendas.contribute : res.agendas.addEvent)
              .replace( ':slug', agenda.slug )}
          >
            {getLabel( 'addAnEvent' )}
          </a>
        )}
        {![ 2, 3 ].includes( agenda.stakeholder.credential ) && _.get( agenda, 'mailto' ) && <a
          href={_.get( agenda, 'mailto' )}
        >
          {getLabel( 'contact' )}
        </a>}
        {![ 2, 3 ].includes( agenda.stakeholder.credential ) && !_.get( agenda, 'mailto' ) && <a
          href={res.agendas.contact.replace( ':slug', agenda.slug )}
        >
          {getLabel( 'contact' )}
        </a>}
      </div>
    );
  }

  onAgendaSearch = value => {
    this.props.history.push( {
      ...this.props.location,
      search: qs.stringify( { ...this.props.query, search: value !== '' ? value : undefined } )
    } );
  };

  getAgendaTitleLink = agenda => {
    return this.props.res.agendas[ agenda.private ? 'showPrivate' : 'show' ].replace( ':slug', agenda.slug );
  };

  render() {
    const { isNew, loading, query, total } = this.props;

    if ( isNew && !total ) {
      return <Welcome />
    }

    if ( loading ) {
      return <Spinner />;
    }

    return (
      <div className="content">
        <AgendasSearch
          id="homeAgendas"
          getTitleLink={this.getAgendaTitleLink}
          Header={this.renderHeader}
          AgendaActionsComponent={this.renderAgendaActions}
          initialValues={{ search: query.search || '' }}
          onSearch={this.onAgendaSearch}
        />
      </div>
    );
  }

};
