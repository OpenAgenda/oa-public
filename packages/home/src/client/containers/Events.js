import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import Waypoint from 'react-waypoint';
import qs from 'qs';
import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import Image from '@openagenda/react-components/build/Image';
import SearchInput from '@openagenda/react-components/build/SearchInput';
import * as agendasActions from '../redux/modules/agendas';
import * as eventsActions from '../redux/modules/events';
import * as modalsActions from '../redux/modules/modals';
import { setTab } from '../redux/modules/menu';
import AgendasSearch from './AgendasSearch';

const selector = formValueSelector( 'homeEvents' );

@provideHooks( {
  fetch: async ( { store: { dispatch, getState }, location } ) => {
    const state = getState();
    const query = qs.parse( location.search, { ignoreQueryPrefix: true } );
    const promises = [
      dispatch( setTab( 'events' ) )
    ];

    if ( !eventsActions.isLoaded( state ) ) {
      promises.push( dispatch( eventsActions.load( query ) ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  ( state, props ) => {
    const query = qs.parse( props.location.search, { ignoreQueryPrefix: true } );

    return {
      initialValues: {
        search: query.search || ''
      },
      query,
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
    };
  },
  { ...eventsActions, ...modalsActions, agendasLoad: agendasActions.load }
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
    getLabel: PropTypes.func
  };

  search = values => this.props.list( values )
    .then( () => {
      this.props.history.push( {
        ...this.props.location,
        search: qs.stringify( { ...this.props.query, search: values.search || undefined } )
      } );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, listLoading, nextLoading, events, perPageLimit } = this.props;
    if ( !events || !events.length || loading || listLoading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
  };

  throttledNextPage = throttle( this.nextPage, 400, { trailing: false } );

  getMultilangLabel( field, defaultValue = '' ) {
    if ( field === null || typeof field !== 'object' ) return field || defaultValue;
    return field[ this.props.lang ] || field[ Object.keys( field )[ 0 ] ] || defaultValue;
  }

  getEventShowLink( event ) {
    const { res } = this.props;

    if ( event.draft ) {

      return this.getEventEditLink( event );

    }

    if ( !event.agenda ) {
      return '#';
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
    const thumbnail = Array.isArray( image.variants ) ? image.variants.find( v => v.type === 'thumbnail' ) : null;

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

  fieldIsVisible = () => {
    const { total, perPageLimit } = this.props;
    const { value, previousValue } = this.state;

    return (
      (value && value !== '')
      || (previousValue && previousValue !== '')
      || total > perPageLimit
    );
  };

  render() {
    const {
      res, handleSubmit, events, loading, listLoading, nextLoading,
      search, perPageLimit, total, query,
      showModal, closeModal, modals, agendasLoad
    } = this.props;
    const { getLabel } = this.context;

    const selectAgendasModal = modals.selectAgenda || {};

    if ( loading ) {
      return <Spinner />;
    }

    return (
      <div className="padding-v-sm">
        <div className="header padding-h-md">
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
        <form className="padding-h-md" onSubmit={handleSubmit( this.search )}>
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
        <div className="clearfix"></div>
        <ul className="list-unstyled padding-top-sm">
          {events && events.map( event => (
          <li key={event.uid} className={'event-item media' + (event.draft ? ' draft' : '')}>
            <div className="padding-all-md">
              <div className="media-left">
                <a
                  href={this.getEventShowLink( event )}
                >
                  <Image
                    src={this.getImagePath( event.image )}
                    fallbackSrc={this.getImagePath( event.image ).replace( 'cibuldev', 'cibul' )}
                    className="media-object ill avatar"
                    alt={this.getMultilangLabel( event.title, getLabel( 'noTitle' ) )}
                  />
                </a>
              </div>
              <div className="media-body">
                <a href={this.getEventShowLink( event )}>
                  <div className="title media-heading">
                    {event.agenda && <div className="agenda">{event.agenda.title}</div>}
                    <strong>{this.getMultilangLabel( event.title , getLabel( 'noTitle' ) )}</strong>
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
                    { event.location && event.location.name ? event.location.name : getLabel('noLocation') }
                  </div>
                  <div className="event-detail-part">
                    {event.timerange}
                  </div>
                </a>

                {event.agenda ? <div className="actions">
                  {event.draft ? <span className="badge badge-sm badge-default">{getLabel( 'draft' )}</span> : null}
                  <a href={this.getEventEditLink( event )}>{getLabel( 'modify' )}</a>
                </div> : null}
              </div>
            </div>
          </li>
          ) )}

          {!events || !events.length && <div className="text-center text-muted margin-top-md">
            {getLabel( search || query.search ? 'noResult' : 'noEventsCreated' )}
          </div>}

          {nextLoading && <li className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner/>
          </li>}
        </ul>

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
            getTitleLink={ agenda => ( agenda.useContributeApp ? res.agendas.contribute : res.agendas.addEvent ).replace( ':slug', agenda.slug ) }
            createButtonIfEmpty
          />
        </Modal>}
      </div>
    );
  }

};
