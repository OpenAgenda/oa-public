import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce, throttle } from 'lodash';
import AgendasSearchComponent from '@openagenda/react-components/build/AgendasSearch';
import * as agendasActions from '../redux/modules/agendas';

const componentPropTypes = PropTypes.oneOfType( [
  PropTypes.element,
  PropTypes.func,
  PropTypes.string
] );

@connect(
  ( state, props ) => ({
    res: state.res,
    agendas: state.agendas[ props.id ].data,
    page: state.agendas[ props.id ].page,
    total: state.agendas[ props.id ].total,
    loading: state.agendas[ props.id ].loading,
    listLoading: state.agendas[ props.id ].listLoading,
    nextLoading: state.agendas[ props.id ].nextLoading,
    perPageLimit: state.settings.perPageLimit
  }),
  agendasActions
)
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
    perPageLimit: PropTypes.number,
    getTitleLink: PropTypes.func,
    createButtonIfEmpty: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  static defaultProps = {
    Header: () => null,
    AgendaActionsComponent: () => null,
    initialValues: {}
  };

  state = {
    value: this.props.initialValues && this.props.initialValues.search !== ''
      ? this.props.initialValues.search
      : undefined
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  search = () => {
    this.props.list( this.props.id, { search: this.state.value } )
      .then( () => {
        if ( this.props.onSearch ) {
          this.props.onSearch( this.state.value );
        }
      } );
  };

  debouncedSearch = debounce( this.search, 400 );

  onSearch = value => {
    if ( this.mounted ) {
      this.setState( {
        previousValue: this.state.value,
        value
      }, () => {
        this.debouncedSearch();
      } );
    }
  }

  nextPage = () => {
    const { page, total, loading, listLoading, nextLoading, agendas, perPageLimit } = this.props;
    const { value } = this.state;
    if ( !agendas || !agendas.length || loading || listLoading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( this.props.id, { search: value }, (page || 1) + 1 );
  };

  throttledNextPage = throttle( this.nextPage, 400, { trailing: false } );

  fieldIsVisible = () => {
    const { total, perPageLimit } = this.props;
    const { value, previousValue } = this.state;

    return (
      (value && value !== '')
      || (previousValue && previousValue !== '')
      || (!previousValue && !value)
      || total > perPageLimit
    );
  };

  render() {
    const {
      id,
      Header,
      agendas,
      listLoading,
      nextLoading,
      getTitleLink,
      AgendaActionsComponent,
      createButtonIfEmpty,
      res,
      initialValues
    } = this.props;
    const { getLabel } = this.context;

    return (
      <AgendasSearchComponent
        form={id}
        Header={Header}
        search={this.onSearch}
        nextPage={this.throttledNextPage}
        agendas={agendas}
        listLoading={listLoading}
        nextLoading={nextLoading}
        getLabel={getLabel}
        fieldIsVisible={this.fieldIsVisible}
        getTitleLink={getTitleLink}
        AgendaActionsComponent={AgendaActionsComponent}
        agendaCreateRes={res.agendas.create}
        createButtonIfEmpty={createButtonIfEmpty}
        initialValues={initialValues}
      />
    );
  }

}
