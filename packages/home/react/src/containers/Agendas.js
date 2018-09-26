"use strict";

const _ = {
  get: require( 'lodash/get' )
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '@openagenda/react-components/build/Spinner';
import { AgendasSearch, Welcome } from '../components';

@connect( state => ({
  res: state.res,
  isNew: state.settings.isNew,
  loading: state.agendas.homeAgendas ? state.agendas.homeAgendas.loading : true,
  total: state.agendas.homeAgendas.total
}) )
export default class Agendas extends Component {

  constructor( props ) {
    super( props );
    this.renderHeader = ::this.renderHeader;
    this.renderAgendaActions = ::this.renderAgendaActions;
  }

  static contextTypes = {
    getLabel: PropTypes.func,
    router: PropTypes.object
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
          className="text-muted"
        >
          {getLabel( 'see' )}
        </a>}
        {[ 2, 3 ].includes( agenda.stakeholder.credential ) && <a
          href={res.agendas.moderate.replace( ':slug', agenda.slug )}
          className="text-muted"
        >
          {agenda.stakeholder.credential === 2 ? getLabel( 'manage' ) : getLabel( 'moderate' )}
        </a>}
        {[ 1, 2, 3 ].includes( agenda.stakeholder.credential ) && <a
          href={( agenda.useContributeApp ? res.agendas.contribute : res.agendas.addEvent ).replace( ':slug', agenda.slug )}
          className="text-muted"
        >
          {getLabel( 'addAnEvent' )}
        </a>}
        {![ 2, 3 ].includes( agenda.stakeholder.credential ) && _.get( agenda, 'mailto' ) && <a
          href={_.get( agenda, 'mailto' )}
          className="text-muted"
        >
          {getLabel( 'contact' )}
        </a>}
        {![ 2, 3 ].includes( agenda.stakeholder.credential ) && !_.get( agenda, 'mailto' ) && <a
          href={res.agendas.contact.replace( ':slug', agenda.slug )}
          className="text-muted"
        >
          {getLabel( 'contact' )}
        </a>}
      </div>
    );
  }

  render() {
    const { isNew, loading, location: { query }, res, total } = this.props;

    if ( isNew && !total ) {
      return <Welcome />
    }

    if ( loading ) {
      return <Spinner />;
    }

    return (
      <AgendasSearch
        id="homeAgendas"
        destroyOnUnmount={false}
        initialValues={{ search: query.search || '' }}
        fieldIsVisible={() => query.search}
        onSearch={values => {
          this.context.router.push( {
            ...this.props.location,
            query: { ...this.props.location.query, search: values.search || undefined }
          } );
        }}
        getTitleLink={agenda =>
          (res.agendas[ agenda.private ? 'showPrivate' : 'show' ].replace( ':slug', agenda.slug ))
        }
        Header={this.renderHeader}
        AgendaActionsComponent={this.renderAgendaActions}
      />
    );
  }

};
