import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import * as agendasActions from '../../redux/modules/agendas';
import { AgendasList, SearchInput } from '../';

const componentPropTypes = PropTypes.oneOfType( [
  PropTypes.element,
  PropTypes.func,
  PropTypes.string
] );

@connect(
  ( state, props ) => {
    const selector = formValueSelector( props.id );

    return {
      form: props.id,
      res: state.res,
      agendas: state.agendas[ props.id ].data,
      page: state.agendas[ props.id ].page,
      total: state.agendas[ props.id ].total,
      loading: state.agendas[ props.id ].loading,
      listLoading: state.agendas[ props.id ].listLoading,
      nextLoading: state.agendas[ props.id ].nextLoading,
      search: selector( state, 'search' ),
      perPageLimit: state.settings.perPageLimit
    };
  },
  agendasActions
)
@reduxForm( {} )
export default class AgendasSearch extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    Header: componentPropTypes,
    AgendaActionsComponent: componentPropTypes,
    list: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    agendas: PropTypes.array,
    page: PropTypes.number,
    total: PropTypes.number,
    loading: PropTypes.bool,
    listLoading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    search: PropTypes.string,
    perPageLimit: PropTypes.number,
    fieldIsVisible: PropTypes.func,
    getTitleLink: PropTypes.func,
    createButtonIfEmpty: PropTypes.bool
  };

  static contextTypes = {
    router: PropTypes.object,
    getLabel: PropTypes.func
  };

  static defaultProps = {
    Header: () => null,
    AgendaActionsComponent: () => null,
    fieldIsVisible: () => true
  };

  search = values => this.props.list( this.props.id, values )
    .then( () => {
      if ( this.props.onSearch ) return this.props.onSearch( values );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, listLoading, nextLoading, agendas, perPageLimit } = this.props;
    if ( !agendas || !agendas.length || loading || listLoading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( this.props.id, { search }, (page || 1) + 1 );
  };

  throttledNextPage = throttle( this.nextPage, 400, { trailing: false } );

  render() {
    const {
      Header, getTitleLink,
      res, handleSubmit, agendas, listLoading, nextLoading, createButtonIfEmpty,
      search, perPageLimit, total, fieldIsVisible, AgendaActionsComponent
    } = this.props;
    const { getLabel } = this.context;

    return (
      <div>
        <div className="header hidden-xs">
          <div className="text-right margin-bottom-md">
            <a href={res.agendas.create} className="btn btn-primary create-agenda">
              {getLabel( 'createAgenda' )}
            </a>
          </div>
        </div>
        <form onSubmit={handleSubmit( this.search )}>
          <Field
            component={SearchInput}
            name="search"
            type="text"
            classNameGroup="search"
            className="form-control"
            placeholder={getLabel( 'searchAgenda' )}
            action={this.debouncedSearch}
            loading={listLoading}
            visible={search || fieldIsVisible() || total > perPageLimit}
          />
        </form>
        <AgendasList
          getTitleLink={getTitleLink}
          agendas={agendas}
          ActionsComponent={AgendaActionsComponent}
        />

        {!agendas || !agendas.length && <div className="text-center text-muted margin-top-md">
          {getLabel( 'noResult' )}
        </div>}

        {(!agendas || !agendas.length) && createButtonIfEmpty && <div className="text-center text-muted margin-top-md">
          <a className="btn btn-primary" href={res.agendas.create}>{getLabel( 'createAgenda' )}</a>
        </div>}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>}

        <Waypoint onEnter={this.throttledNextPage} />
      </div>
    );
  }

}
