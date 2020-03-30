import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { Link } from 'react-router-dom';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { Waypoint } from 'react-waypoint';
import qs from 'qs';
import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import Image from '@openagenda/react-components/build/Image';
import SearchInput from '@openagenda/react-components/build/SearchInput';
import I18nContext from '../contexts/I18nContext';
import * as agendasActions from '../reducers/agendas';
import * as eventsActions from '../reducers/events';
import * as modalsActions from '../reducers/modals';
import { setTab } from '../reducers/menu';
import AgendasSearch from '../components/AgendasSearch';

function AgendaItem({ agenda, res, getLabel }) {
  const itemLink = (agenda.useContributeApp
    ? res.agendas.contribute
    : res.agendas.addEvent
  ).replace(':slug', agenda.slug);

  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <a href={itemLink}>
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
            className="media-object ill avatar"
            alt={agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <a href={itemLink}>
            <strong>{agenda.title}</strong>

            {!!agenda.official && (
              <span className="official">
                <i />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow" />
                  <div className="tooltip-inner">
                    {getLabel('officialAgenda')}
                  </div>
                </div>
              </span>
            )}
          </a>

          {!!agenda.private && (
            <div className="tooltip-icon">
              <i className="fa fa-unlock-alt" />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">{getLabel('privateAgenda')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

@hot
@provideHooks({
  fetch: ({ store: { dispatch } }) => dispatch(setTab('events')),
  defer: async ({ store: { dispatch }, location }) => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    // if ( !eventsActions.isLoaded( state ) ) {
    promises.push(dispatch(eventsActions.load(query)));
    // }

    return promises;
  }
})
@connect(
  (state, props) => ({
    query: qs.parse(props.location.search, { ignoreQueryPrefix: true }),
    res: state.res,
    events: state.events.data,
    page: state.events.page,
    total: state.events.total,
    loading: state.events.loading === undefined ? true : state.events.loading,
    listLoading: state.events.listLoading,
    nextLoading: state.events.nextLoading,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals
  }),
  { ...eventsActions, ...modalsActions, agendasLoad: agendasActions.load }
)
export default class Events extends Component {
  static contextType = I18nContext;

  constructor(props, context) {
    super(props, context);

    const { query } = props;

    this.state = {
      value: query && query.search ? query.search : undefined
    };

    this.debouncedSearch = debounce(this.search, 400);

    this.throttledNextPage = throttle(this.nextPage, 400, { trailing: false });

    this.searchInputProps = {
      placeholder: context.getLabel('searchAgenda'),
      classNameGroup: 'form-group search',
      className: 'form-control',
      autoComplete: 'off',
      autoFocus: true
    };
  }

  search = () => this.props.list({ search: this.state.value }).finally(() => {
    this.props.history.push({
      ...this.props.location,
      search: qs.stringify({
        ...this.props.query,
        search: this.state.value || undefined
      })
    });
  });

  onSearch = value => this.setState(
    prevState => ({
      previousValue: prevState.value,
      value
    }),
    () => {
      this.debouncedSearch();
    }
  );

  nextPage = () => {
    const {
      page,
      total,
      search,
      loading,
      listLoading,
      nextLoading,
      events,
      perPageLimit
    } = this.props;
    if (
      !events
      || !events.length
      || loading
      || listLoading
      || nextLoading
      || page * perPageLimit >= total
    ) return;
    this.props.nextPage({ search }, (page || 1) + 1);
  };

  getMultilangLabel = (field, defaultValue = '') => {
    if (field === null || typeof field !== 'object') return field || defaultValue;
    return (
      field[this.props.lang] || field[Object.keys(field)[0]] || defaultValue
    );
  };

  getEventShowLink = event => {
    const { res } = this.props;

    if (event.draft) {
      return this.getEventEditLink(event);
    }

    if (!event.agenda) {
      return '#';
    }

    return res.events[event.private ? 'showPrivate' : 'show']
      .replace(':slug', event.agenda.slug)
      .replace(':eventSlug', event.slug);
  };

  getEventEditLink = event => {
    const { res } = this.props;

    return res.events.edit
      .replace(':slug', event.agenda && event.agenda.slug)
      .replace(':eventSlug', event.slug);
  };

  getImagePath = image => {
    const thumbnail = Array.isArray(image.variants)
      ? image.variants.find(v => v.type === 'thumbnail')
      : null;

    const { filename } = thumbnail || image;
    const { base } = image;

    const trailingBaseSlash = base.slice(-1) === '/';
    const leadingFilenameSlash = filename.slice(1) === '/';

    if (trailingBaseSlash && leadingFilenameSlash) {
      return base.slice(0, -1) + filename;
    }

    if (trailingBaseSlash || leadingFilenameSlash) {
      return base + filename;
    }

    return `${base}/${filename}`;
  };

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
      res,
      events,
      loading,
      listLoading,
      nextLoading,
      query,
      showModal,
      closeModal,
      modals,
      agendasLoad
    } = this.props;
    const { getLabel } = this.context;

    const selectAgendasModal = modals.selectAgenda || {};

    if (loading) {
      return <Spinner />;
    }

    return (
      <Form
        onSubmit={this.search}
        initialValues={{
          search: query.search || ''
        }}
        keepDirtyOnReinitialize
        render={({ handleSubmit, values }) => (
          <div className="padding-v-sm">
            <div className="header padding-h-md">
              <div className="hidden-xs pull-right">
                <button
                  onClick={() => agendasLoad('selectAgendasForCreateEvent').then(() => showModal('selectAgenda'))}
                  className="btn btn-primary"
                  type="button"
                >
                  {getLabel('createEvent')}
                </button>
              </div>
            </div>
            <form className="padding-h-md" onSubmit={handleSubmit}>
              <Field
                component={SearchInput}
                name="search"
                type="text"
                classNameGroup="search"
                className="form-control"
                placeholder={getLabel('searchEvent')}
                action={value => this.onSearch(value === '' ? undefined : value)}
                loading={listLoading}
                visible={this.fieldIsVisible()}
              />
            </form>
            <div className="clearfix" />
            <ul className="list-unstyled padding-top-sm">
              {events
                && events.map(event => (
                  <li
                    key={event.uid}
                    className={`event-item media${event.draft ? ' draft' : ''}`}
                  >
                    <div className="padding-all-md" title={getLabel('show')}>
                      <div className="media-left">
                        <a href={this.getEventShowLink(event)}>
                          <Image
                            src={this.getImagePath(event.image)}
                            fallbackSrc={this.getImagePath(event.image).replace(
                              'cibuldev',
                              'cibul'
                            )}
                            className="media-object ill avatar"
                            alt={this.getMultilangLabel(
                              event.title,
                              getLabel('noTitle')
                            )}
                          />
                        </a>
                      </div>
                      <div className="media-body">
                        <a href={this.getEventShowLink(event)}>
                          <div className="title media-heading">
                            {event.agenda ? (
                              <div className="agenda">{event.agenda.title}</div>
                            ) : null}
                            <strong>
                              {this.getMultilangLabel(
                                event.title,
                                getLabel('noTitle')
                              )}
                            </strong>
                            {event.private ? (
                              <div className="tooltip-icon">
                                <i className="fa fa-unlock-alt" />
                                <div className="tooltip right" role="tooltip">
                                  <div className="tooltip-arrow" />
                                  <div className="tooltip-inner">
                                    {getLabel('privateEvent')}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                            {/* !!event.draft && <div className="badge badge-sm badge-default">{getLabel( 'draft' )}</div> */}
                          </div>
                          <div className="event-detail-part">
                            {event.location && event.location.name
                              ? event.location.name
                              : getLabel('noLocation')}
                          </div>
                          <div className="event-detail-part">
                            {event.timerange}
                          </div>
                        </a>

                        {event.agenda ? (
                          <div className="actions">
                            {event.draft ? (
                              <span className="badge badge-sm badge-default">
                                {getLabel('draft')}
                              </span>
                            ) : <a href={this.getEventShowLink(event)}>{getLabel('show')}</a>}
                            <a href={this.getEventEditLink(event)}>
                              {getLabel('modify')}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}

              {!events
                || (!events.length && (
                  <div className="text-center text-muted margin-top-md">
                    {getLabel(
                      values.search || query.search
                        ? 'noResult'
                        : 'noEventsCreated'
                    )}
                  </div>
                ))}

              {nextLoading && (
                <li className="padding-v-md" style={{ position: 'relative' }}>
                  <Spinner />
                </li>
              )}
            </ul>

            <Waypoint onEnter={this.throttledNextPage} />

            {selectAgendasModal.visible && (
              <Modal
                title={getLabel('selectAgenda')}
                onClose={() => closeModal('selectAgenda')}
                classNames={{
                  overlay: 'popup-overlay big'
                }}
                disableBodyScroll
              >
                <AgendasSearch
                  res={res.agendas.list}
                  fieldProps={this.searchInputProps}
                  render={({ state, form, nextPage }) => (
                    <div>
                      {form}

                      <div>
                        {state.agendas.length
                          ? state.agendas.map(agenda => (
                            <AgendaItem
                              key={agenda.uid}
                              agenda={agenda}
                              res={res}
                              getLabel={getLabel}
                            />
                          ))
                          : null}
                      </div>

                      {!state.agendas.length ? (
                        <div className="text-center text-muted margin-top-md">
                          <Link
                            to={res.agendas.create}
                            className="btn btn-primary"
                            type="button"
                          >
                            {getLabel('createAgenda')}
                          </Link>
                        </div>
                      ) : null}

                      {state.nextLoading ? (
                        <div
                          className="padding-v-md"
                          style={{ position: 'relative' }}
                        >
                          <Spinner />
                        </div>
                      ) : null}

                      <Waypoint onEnter={nextPage} />
                    </div>
                  )}
                />
              </Modal>
            )}
          </div>
        )}
      />
    );
  }
}
