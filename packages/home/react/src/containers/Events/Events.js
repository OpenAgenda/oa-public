import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import monitorBottomHit from 'dom-utils/monitorBottomHit2';
import Spinner from 'react-form-components/build/Spinner';
import Modal from 'react-components/build/Modal';
import * as agendasActions from '../../redux/modules/agendas';
import * as eventsActions from '../../redux/modules/events';
import * as modalsActions from '../../redux/modules/modals';
import { SearchInput, AgendasSearch } from '../../components';

const selector = formValueSelector( 'homeEvents' );


@asyncConnect( [ {
  promise: ( { store: { dispatch, getState }, helpers: { redirect } } ) => {
    const state = getState();
    const query = state.routing.locationBeforeTransitions.query;
    const promises = [];

    if ( state.settings.isNew ) {
      return redirect( '/' );
    }

    if ( !eventsActions.isLoaded( state ) ) {
      promises.push( dispatch( eventsActions.load( query ) ) );
    }

    return Promise.all( promises );
  }
} ] )
@connect(
  ( state, props ) => ({
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    events: state.events.data,
    page: state.events.page,
    total: state.events.total,
    loading: state.events.loading,
    search: selector( state, 'search' ),
    perPageLimit: state.settings.perPageLimit,
    lang: state.settings.lang,
    modals: state.modals
  }),
  { ...eventsActions, ...modalsActions, agendasLoad: agendasActions.load, replace }
)
@reduxForm( {
  form: 'homeEvents'
} )
export default class Events extends Component {

  static propTypes = {
    list: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    events: PropTypes.array,
    page: PropTypes.number,
    total: PropTypes.number,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    search: PropTypes.string,
    perPageLimit: PropTypes.number,
    showModal: PropTypes.func,
    closeModal: PropTypes.func,
    modals: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object,
    getLabel: PropTypes.func
  };

  search = values => this.props.list( values )
    .then( () => {
      this.context.router.push( {
        ...this.props.location,
        query: { ...this.props.location.query, search: values.search || undefined }
      } );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, nextLoading, events, perPageLimit } = this.props;
    if ( !events || !events.length || loading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
  };

  componentDidMount() {
    if ( typeof document === 'undefined' || this.props.isNew ) return;
    this.stopMonitorBottomHit = monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
  }

  componentWillUnmount() {
    this.stopMonitorBottomHit();
  }

  getMultilangLabel( field ) {
    if ( field === null || typeof field !== 'object' ) return field;
    return field[ this.props.lang ] || field[ Object.keys( field )[ 0 ] ];
  }

  render() {
    const {
      res, handleSubmit, events, loading, nextLoading,
      search, perPageLimit, total, location: { query },
      showModal, closeModal, modals, agendasLoad
    } = this.props;
    const { getLabel, lang } = this.context;

    const selectAgendasModal = modals.selectAgenda || {};

    return (
      <div>
        <div className="header">
          <h2 className="hidden-xs">{getLabel( 'myEvents' )}</h2>
          <div className="hidden-xs pull-right">
            <a
              onClick={() => agendasLoad( 'selectAgendasForCreateEvent' )
                .then( () => showModal( 'selectAgenda' ) )}
              className="btn btn-primary"
              type="button"
            >
              {getLabel( 'createEvent' )}
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
            placeholder={getLabel( 'searchEvent' )}
            action={this.debouncedSearch}
            loading={loading}
            visible={search || query.search || total > perPageLimit}
          />
        </form>
        <div className="row">
          {events && events.map( ( event, i ) => (
            <div className="event-item media" key={i}>

              <div className="media-left">
                <a
                  href={res.events[ event.private ? 'showPrivate' : 'show' ]
                    .replace( ':slug', event.agenda && event.agenda.slug )
                    .replace( ':eventSlug', event.slug )}
                >
                  <img
                    className="media-object ill avatar"
                    src={event.image.path}
                    alt={this.getMultilangLabel( event.title )}
                  />
                </a>
              </div>
              <div className="media-body">
                <div className="title media-heading">
                  <div className="agenda">{event.agenda && event.agenda.title}</div>
                  <a
                    href={res.events[ event.private ? 'showPrivate' : 'show' ]
                      .replace( ':slug', event.agenda && event.agenda.slug )
                      .replace( ':eventSlug', event.slug )}
                  >
                    <strong>{this.getMultilangLabel( event.title )}</strong>
                  </a>
                  {!!event.private && <div className="tooltip-icon">
                    <i className="fa fa-unlock-alt"></i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"></div>
                      <div className="tooltip-inner">{getLabel( 'privateEvent' )}</div>
                    </div>
                  </div>}
                  {!!event.draft && <div className="badge badge-sm badge-default">{getLabel( 'draft' )}</div>}
                </div>
                <div className="actions">
                  {event.location && event.location.name}
                </div>
                <div className="actions">
                  {event.timerange}
                </div>
              </div>
            </div>
          ) )}

          {!events || !events.length && <div className="text-center text-muted margin-top-md">
            {getLabel( 'noResult' )}
          </div>}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>}

          {selectAgendasModal.visible && <Modal
            title={getLabel( 'selectAgenda' )}
            onClose={() => closeModal( 'selectAgenda' )}
            classNames={{
              overlay: 'popup-overlay big'
            }}
            modalRef={ref => {
              this.selectAgendasModalRef = ref;
              this.forceUpdate();
            }}
            disableBodyScroll
          >
            <AgendasSearch
              id="selectAgendasForCreateEvent"
              refForLoadNextPage={this.selectAgendasModalRef}
              getTitleLink={agenda => res.agendas.addEvent.replace( ':slug', agenda.slug )}
              createButtonIfEmpty
            />
          </Modal>}
        </div>
      </div>
    );
  }

};
