import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import * as agendasActions from '../../redux/modules/agendas';
import { AgendasSearch, Welcome } from '../../components';

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const state = getState();
    const query = state.routing.locationBeforeTransitions.query;

    if ( !agendasActions.isLoaded( 'homeAgendas', state ) ) {
      return dispatch( agendasActions.load( 'homeAgendas', query ) );
    }
  }
} ] )
@connect( state => ({
  res: state.res,
  isNew: state.settings.isNew
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
        {agenda.stakeholder.credential > 1 && <a
          href={res.moderate.replace( ':slug', agenda.slug )}
          className="text-muted"
        >
          {agenda.stakeholder.credential == 2 ? getLabel( 'manage' ) : getLabel( 'moderate' )}
        </a>}
        <a href={res[ 'agendas' ].addEvent.replace( ':slug', agenda.slug )} className="text-muted">
          {getLabel( 'addAnEvent' )}
        </a>
      </div>
    );
  }

  render() {
    const { isNew, location: { query }, res } = this.props;

    if ( isNew ) {
      return <Welcome />
    }

    return (
      <div>
        <AgendasSearch
          id="homeAgendas"
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
      </div>
    );
  }

};
