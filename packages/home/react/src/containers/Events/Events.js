import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import Image from '@openagenda/react-components/build/Image';
import * as agendasActions from '../../redux/modules/agendas';
import * as eventsActions from '../../redux/modules/events';
import * as modalsActions from '../../redux/modules/modals';
import { SearchInput, AgendasSearch } from '../../components';

const selector = formValueSelector( 'homeEvents' );


@asyncConnect( [ {
  deferred: !__CLIENT__,
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

    return Promise.all( __CLIENT__ ? [] : promises );
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
    listLoading: state.events.listLoading,
    nextLoading: state.events.nextLoading,
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
    listLoading: PropTypes.bool,
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
    const { page, total, search, loading, listLoading, nextLoading, events, perPageLimit } = this.props;
    if ( !events || !events.length || loading || listLoading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
  };

  throttledNextPage = throttle( this.nextPage, 400, { trailing: false } );

  getMultilangLabel( field ) {
    if ( field === null || typeof field !== 'object' ) return field;
    return field[ this.props.lang ] || field[ Object.keys( field )[ 0 ] ];
  }

  getEventShowLink( event ) {
    const { res } = this.props;

    if ( !event.agenda ) {
      return res.events.showWithoutAgenda.replace( ':eventSlug', event.slug );
    }

    return res.events[ event.private ? 'showPrivate' : 'show' ]
      .replace( ':slug', event.agenda.slug )
      .replace( ':eventSlug', event.slug );
  }

  getEventEditLink( event ) {
    const { res } = this.props;

    return res.events.edit
      .replace( ':slug', event.agenda.slug )
      .replace( ':eventSlug', event.slug );
  }

  getImagePath( image ) {
    const thumbnail = _.find( image.variants, [ 'type', 'thumbnail' ] );

    const { filename } = thumbnail || image;
    const { base } = image;

    const trailingBaseSlash = base.slice( -1 ) === '/';
    const leadingFilenameSlash = filename.slice( 1 ) === '/';

    if ( trailingBaseSlash && leadingFilenameSlash ) {
      return base.slice( 0, -1 ) + filename;
    }

    if ( trailingBaseSlash || leadingFilenameSlash ) {
      return base + filename;
    }

    return base + '/' + filename;
  }

  render() {
    const {
      res, handleSubmit, events, loading, listLoading, nextLoading,
      search, perPageLimit, total, location: { query },
      showModal, closeModal, modals, agendasLoad
    } = this.props;
    const { getLabel } = this.context;

    const selectAgendasModal = modals.selectAgenda || {};

    if ( loading ) {
      return <Spinner/>;
    }

    return (
      <div>
        <div className="header">
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
            loading={listLoading}
            visible={search || query.search || total > perPageLimit}
          />
        </form>
        <div>
          {events && events.map( ( event, i ) => (
            <div className="event-item media" key={i}>
              <div className="media-left">
                <a
                  href={this.getEventShowLink( event )}
                >
                  <Image
                    src={this.getImagePath( event.image )}
                    fallbackSrc={this.getImagePath( event.image ).replace( 'cibuldev', 'cibul' )}
                    className="media-object ill avatar"
                    alt={this.getMultilangLabel( event.title )}
                  />
                </a>
              </div>
              <div className="media-body">
                <div className="title media-heading">
                  {event.agenda && <div className="agenda">{event.agenda.title}</div>}
                  <a href={this.getEventShowLink( event )}>
                    <strong>{this.getMultilangLabel( event.title )}</strong>
                  </a>
                  {!!event.private && <div className="tooltip-icon">
                    <i className="fa fa-unlock-alt"></i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"></div>
                      <div className="tooltip-inner">{getLabel( 'privateEvent' )}</div>
                    </div>
                  </div>}
                  {/* !!event.draft && <div className="badge badge-sm badge-default">{getLabel( 'draft' )}</div> */}
                </div>
                <div className="event-detail-part">
                  {event.location && event.location.name}
                </div>
                <div className="event-detail-part">
                  {event.timerange}
                </div>

                {event.agenda ? <div className="actions">
                  <a
                    href={this.getEventEditLink( event )}
                    className="text-muted"
                  >
                    {getLabel( 'modify' )}
                  </a>
                </div> : null}
              </div>
            </div>
          ) )}

          {!events || !events.length && <div className="text-center text-muted margin-top-md">
            {getLabel( 'noResult' )}
          </div>}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner/>
          </div>}

          <Waypoint onEnter={this.throttledNextPage}/>

          {selectAgendasModal.visible && <Modal
            title={getLabel( 'selectAgenda' )}
            onClose={() => closeModal( 'selectAgenda' )}
            classNames={{
              overlay: 'popup-overlay big'
            }}
            disableBodyScroll
          >
            <AgendasSearch
              id="selectAgendasForCreateEvent"
              getTitleLink={agenda => res.agendas.addEvent.replace( ':slug', agenda.slug )}
              createButtonIfEmpty
              clearfixAfterButton
            />
          </Modal>}
        </div>
      </div>
    );
  }

};
