import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { Waypoint } from 'react-waypoint';
import qs from 'qs';
import {
  withLayoutData,
  Spinner,
  Modal,
  Image,
  SearchInput,
} from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import * as agendasActions from '../reducers/agendas';
import * as eventsActions from '../reducers/events';
import * as modalsActions from '../reducers/modals';
import { setTab } from '../reducers/menu';
import AgendasSearch from '../components/AgendasSearch';
import EventItem from '../components/EventItem';
import Wrapper from './Wrapper';

function AgendaItem({ agenda, res, getLabel }) {
  const itemLink = res.agendas.contribute.replace(':slug', agenda.slug);

  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <Link
          to={itemLink}
          className="btn btn-link padding-left-z padding-top-z"
        >
          <Image
            src={agenda.image}
            fallbackSrc={agenda.image.replace('cibuldev', 'cibul')}
            className="media-object ill avatar"
            alt={agenda.title}
          />
        </Link>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <Link
            to={itemLink}
            className="btn btn-link padding-left-z padding-top-z"
          >
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
          </Link>
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

@withLayoutData('lang')
@provideHooks({
  fetch: ({ store: { dispatch } }) => dispatch(setTab('events')),
  defer: async ({ store: { dispatch }, location }) => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    // if ( !eventsActions.isLoaded( state ) ) {
    promises.push(dispatch(eventsActions.load(query)));
    // }

    return promises;
  },
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
    modals: state.modals,
  }),
  { ...eventsActions, ...modalsActions, agendasLoad: agendasActions.load }
)
export default class Events extends Component {
  static contextType = I18nContext;

  constructor(props, context) {
    super(props, context);

    const { query } = props;

    this.state = {
      value: query && query.search ? query.search : undefined,
    };

    this.debouncedSearch = debounce(this.search, 400);

    this.throttledNextPage = throttle(this.nextPage, 400, { trailing: false });

    this.searchInputProps = {
      placeholder: context.getLabel('searchAgenda'),
      classNameGroup: 'form-group search',
      className: 'form-control',
      autoComplete: 'off',
      autoFocus: true,
    };
  }

  search = () => this.props.list({ search: this.state.value }).finally(() => {
    this.props.history.push({
      ...this.props.location,
      search: qs.stringify({
        ...this.props.query,
        search: this.state.value || undefined,
      }),
    });
  });

  onSearch = value => this.setState(
    prevState => ({
      previousValue: prevState.value,
      value,
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
      perPageLimit,
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
      agendasLoad,
      lang,
    } = this.props;
    const { getLabel } = this.context;

    const selectAgendasModal = modals.selectAgenda || {};

    if (loading) {
      return (
        <Wrapper>
          <Spinner />
        </Wrapper>
      );
    }

    return (
      <Wrapper tab="events" className="home-events">
        <Form
          onSubmit={this.search}
          initialValues={{
            search: query.search || '',
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
                    <EventItem
                      key={`event-${event.uid}`}
                      event={event}
                      res={res.events}
                      getLabel={getLabel}
                      lang={lang}
                    />
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
                    overlay: 'popup-overlay big',
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
      </Wrapper>
    );
  }
}
