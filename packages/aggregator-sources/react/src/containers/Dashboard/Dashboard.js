import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import Modal from 'react-components/build/Modal';
import Spinner from 'react-form-components/build/Spinner';
import * as agendaActions from '../../redux/modules/agenda';
import * as sourcesActions from '../../redux/modules/sources';
import * as modalsActions from '../../redux/modules/modals';

const selector = formValueSelector( 'aggregatorSourcesDashboard' );

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};


@asyncConnect( [ {
    promise: ( { store: { dispatch, getState } } ) => {
      const state = getState();
      const query = state.routing.locationBeforeTransitions.query;

      if ( !sourcesActions.isLoaded( state ) ) {
        return dispatch( sourcesActions.load( query ) );
      }
    }
  } ],
  ( state, props ) => ({
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    agendas: state.sources.data,
    page: state.sources.page,
    total: state.sources.total,
    loading: state.sources.loading,
    nextLoading: state.sources.nextLoading,
    search: selector( state, 'search' ),
    agenda: state.agenda,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals
  }),
  { ...sourcesActions, ...modalsActions, ...agendaActions }
)
@reduxForm( {
  form: 'aggregatorSourcesDashboard'
} )
export default class Dashboard extends Component {

  static propTypes = {
    list: PropTypes.func,
    remove: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    agendas: PropTypes.array,
    page: PropTypes.number,
    total: PropTypes.number,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    search: PropTypes.string,
    slug: PropTypes.string,
    perPageLimit: PropTypes.number,
    modals: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object,
    getLabel: PropTypes.func
  };

  renderField = ( {
    content, input: { name, value }, label, subLabel, max, classNameGroup, visible,
    errorOnDirty, meta: { touched, error, dirty }
  } ) => {
    const displayError = errorOnDirty ? dirty || touched : touched;

    if ( !visible ) return <div></div>;

    return (
      <div className={`form-group ${classNameGroup} ${displayError && error ? 'has-error has-feedback' : ''}`}>
        {label && <label htmlFor={name}>{label}</label>}
        {subLabel}
        {content}
        {displayError && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
        {displayError && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
          {this.context.getLabel( error )}
        </div>}
        {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
          {max - value.length}
        </div>}
      </div>
    );
  };

  renderSearchInput = ( { type, placeholder, className, spellCheck, action, loading, ...props } ) => {
    const inputAttrs = { type, placeholder, className, spellCheck };
    const onChange = e => {
      props.input.onChange( e.target.value );
      action();
    };
    const content = <div className="input-icon-right">
      <input {...props.input} {...inputAttrs} onChange={onChange} />
      <button type="submit" className="btn">
        {loading ? <Spinner spinner={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
      </button>
    </div>;
    return this.renderField( { content, ...props } );
  };

  search = values => this.props.list( values )
    .then( () => {
      this.context.router.push( {
        query: { ...this.props.location.query, search: values.search || undefined }
      } );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, agendas } = this.props;
    if ( !agendas || !agendas.length || loading || page * this.props.perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
  };

  componentWillMount() {
    if ( typeof document === 'undefined' ) return;
    monitorBottomHit( throttle( this.nextPage, 400 ) );
  }

  render() {
    const {
      res, handleSubmit, agendas, total, loading, nextLoading,
      showModal, closeModal, modals, remove, createAggregator,
      search, agenda, perPageLimit, location: { query }
    } = this.props;
    const { getLabel } = this.context;

    const removeModal = modals.removeSource || {};

    if ( !agenda.isAggregator ) {

      return (
        <div className="margin-top-sm">
          <p>{getLabel( 'aggregatorExplanation' )}</p>
          <div>
            <button className="btn btn-default" onClick={createAggregator}>{getLabel( 'createAggregator' )}</button>
          </div>
        </div>
      );

    }

    return (
      <div>
        <div className="header">
          <h2>{getLabel( 'sourceAgendas' )}</h2>
          <p
            className="text-muted"
            dangerouslySetInnerHTML={{
              __html: getLabel( 'sourcesExplanation', { title: `<a href="${res.show.replace( ':slug', agenda.slug )}">${agenda.title}</a>` } )
            }}
          />
          <p
            className="text-muted"
            dangerouslySetInnerHTML={{
              __html: getLabel( 'addSources', { searchLink: res.search } )
            }}
          />
          <form onSubmit={handleSubmit( this.search )}>
            <Field
              component={this.renderSearchInput}
              name="search"
              type="text"
              classNameGroup="search margin-v-md"
              className="form-control"
              placeholder={getLabel( 'searchAgenda' )}
              action={this.debouncedSearch}
              loading={loading}
              visible={search || query.search || total >= perPageLimit}
            />
          </form>
        </div>
        <div className="row">
          {agendas && agendas.map( agendaItem => (
            <div className="agenda-item media" key={agendaItem.uid}>
              <div className="media-left">
                <a href={res.show.replace( ':slug', agendaItem.slug )}>
                  <img className="media-object ill avatar" src={agendaItem.image} alt={agendaItem.title} />
                </a>
              </div>
              <div className="media-body">
                <div className="title media-heading">
                  <a href={res.show.replace( ':slug', agendaItem.slug )}><strong>{agendaItem.title}</strong></a>
                  {!!agendaItem.official && <div className="official">
                    <i />
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow" />
                      <div className="tooltip-inner">{getLabel( 'officialAgenda' )}</div>
                    </div>
                  </div>}
                </div>
                <div className="actions">
                  <a
                    role="button"
                    onClick={() => showModal( 'removeSource', { uid: agendaItem.uid } )}
                    className="text-muted"
                  >
                    {getLabel( 'removeSource' )}
                  </a>
                </div>
              </div>
            </div>
          ) )}

          {!agendas || !agendas.length ? <div className="text-center text-muted margin-v-md">
              {getLabel( 'noResult' )}
            </div> : null}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>}
        </div>

        <Modal
          title={getLabel( 'removeSource' )}
          visible={removeModal.visible || false}
          onClose={() => closeModal( 'removeSource' )}
        >
          <p className="margin-top-sm">{getLabel( 'removeConfirmMessage' )}</p>
          <div className="text-center">
            <button
              className="btn btn-danger"
              onClick={() => remove( removeModal.uid )
                .then( () => closeModal( 'removeSource' ) )}
            >
              {getLabel( 'removeSource' )}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

};
