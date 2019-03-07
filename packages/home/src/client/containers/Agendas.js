import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import qs from 'qs';
import Spinner from '@openagenda/react-components/build/Spinner';
import { setTab } from '../redux/modules/menu';
import { AgendasSearch, Welcome } from '../components';

@provideHooks({
  fetch: ( { store: { dispatch } } ) => dispatch( setTab( 'agendas' ) )
})
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

    return <div className="header">
      <h2 className="hidden-xs">{getLabel( 'myAgendas' )}</h2>
      <div className="hidden-xs pull-right">
        <a href={res.agendas.create} className="btn btn-primary" type="button">
          {getLabel( 'createAgenda' )}
        </a>
      </div>
    </div>;
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
        {[ 1, 2, 3 ].includes( agenda.stakeholder.credential ) && <a
          href={( agenda.useContributeApp ? res.agendas.contribute : res.agendas.addEvent ).replace( ':slug', agenda.slug )}
        >
          {getLabel( 'addAnEvent' )}
        </a>}
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

  render() {
    const { isNew, loading, query, res, total, history } = this.props;

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
          destroyOnUnmount={false}
          initialValues={{ search: query.search || '' }}
          fieldIsVisible={() => query.search}
          onSearch={values => {
            history.push( {
              ...this.props.location,
              search: qs.stringify( { ...query, search: values.search || undefined } )
            } );
          }}
          getTitleLink={agenda =>
            (res.agendas[ agenda.private ? 'showPrivate' : 'show' ].replace( ':slug', agenda.slug ))
          }
          Header={this.renderHeader}
          AgendaActionsComponent={this.renderAgendaActions}
        />
      </div>
    );
  }

};
