import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { Waypoint } from 'react-waypoint';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import AgendasList from './AgendasList';
import SearchInput from './SearchInput';

const componentPropTypes = PropTypes.oneOfType( [
  PropTypes.element,
  PropTypes.func,
  PropTypes.string
] );


export default class AgendasSearch extends Component {

  static propTypes = {
    Header: componentPropTypes,
    search: PropTypes.func,
    nextPage: PropTypes.func,
    agendas: PropTypes.array,
    listLoading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    getLabel: PropTypes.func,
    fieldIsVisible: PropTypes.func,
    getTitleLink: PropTypes.func,
    AgendaActionsComponent: componentPropTypes,
    agendaCreateRes: PropTypes.string,
    createButtonIfEmpty: PropTypes.bool,
    initialValues: PropTypes.object
  };

  static defaultProps = {
    Header: () => null,
    AgendaActionsComponent: () => null,
    fieldIsVisible: () => true
  };

  submit = values => this.props.search( values.search );

  renderForm = ( { handleSubmit } ) => {
    const { search, getLabel, listLoading, fieldIsVisible } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          component={SearchInput}
          name="search"
          type="text"
          classNameGroup="search"
          className="form-control"
          placeholder={getLabel( 'searchAgenda' )}
          loading={listLoading}
          visible={fieldIsVisible()}
          action={value => search( value === '' ? undefined : value )}
          parse={value => value === '' ? undefined : value}
          format={value => value == null ? '' : value}
          getLabel={getLabel}
        />
      </form>
    );
  };

  render() {
    const {
      Header, getTitleLink, AgendaActionsComponent, nextPage, getLabel, agendaCreateRes,
      agendas, nextLoading, createButtonIfEmpty, initialValues
    } = this.props;

    return (
      <div>
        {Header ? React.createElement( Header ) : null}
        <Form
          subscription={{}}
          initialValues={initialValues}
          onSubmit={this.submit}
          render={this.renderForm}
        />
        <AgendasList
          getLabel={getLabel}
          getTitleLink={getTitleLink}
          agendas={agendas}
          ActionsComponent={AgendaActionsComponent}
        />

        {!agendas || !agendas.length && <div className="text-center text-muted margin-top-md">
          {getLabel( 'noResult' )}
        </div>}

        {(!agendas || !agendas.length) && createButtonIfEmpty && <div className="text-center text-muted margin-top-md">
          <a className="btn btn-primary" href={agendaCreateRes}>{getLabel( 'createAgenda' )}</a>
        </div>}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>}

        <Waypoint onEnter={nextPage} />
      </div>
    );
  }

}
