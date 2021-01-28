import _ from 'lodash';
import React, { useContext, useMemo, useCallback } from 'react';
import { hot } from 'react-hot-loader/root';
import { useHistory, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { useIsomorphicLayoutEffect } from 'react-use';
import qs from 'qs';
import { Spinner, Image } from '@openagenda/react-components';
import I18nContext from '../contexts/I18nContext';
import { setTab } from '../reducers/menu';
import Welcome from '../components/Welcome';
import AgendasSearch from '../components/AgendasSearch';

function AgendaItem({ agenda, res, getLabel }) {
  return (
    <div className="agenda-item media" key={agenda.uid}>
      <div className="media-left">
        <a href={`/${agenda.slug}${agenda.private ? '.prv' : ''}`}>
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
          <a href={`/${agenda.slug}${agenda.private ? '.prv' : ''}`}>
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

        <div className="actions">
          {[4].includes(agenda.member.role) && (
            <a
              href={res.agendas[
                agenda.private ? 'showPrivate' : 'show'
              ].replace(':slug', agenda.slug)}
            >
              {getLabel('see')}
            </a>
          )}
          {[2, 3].includes(agenda.member.role) && (
            <>
              {agenda?.settings?.lab?.eventAdmin ? (
                <Link to={`/${agenda.slug}/admin/events`}>
                  {agenda.member.role === 2
                    ? getLabel('manage')
                    : getLabel('moderate')}
                </Link>
              ) : (
                <a href={res.agendas.moderate.replace(':slug', agenda.slug)}>
                  {agenda.member.role === 2
                    ? getLabel('manage')
                    : getLabel('moderate')}
                </a>
              )}
            </>
          )}
          {[1, 2, 3].includes(agenda.member.role) && (
            <a
              href={(agenda.useContributeApp
                ? res.agendas.contribute
                : res.agendas.addEvent
              ).replace(':slug', agenda.slug)}
            >
              {getLabel('addAnEvent')}
            </a>
          )}
          {![2, 3].includes(agenda.member.role) && _.get(agenda, 'mailto') && (
            <a href={_.get(agenda, 'mailto')}>{getLabel('contact')}</a>
          )}
          {![2, 3].includes(agenda.member.role) && !_.get(agenda, 'mailto') && (
            <a href={res.agendas.contact.replace(':slug', agenda.slug)}>
              {getLabel('contact')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Agendas({ user }) {
  const { getLabel } = useContext(I18nContext);

  const history = useHistory();
  const query = useMemo(
    () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
    [history.location.search]
  );

  const dispatch = useDispatch();

  useIsomorphicLayoutEffect(() => {
    dispatch(setTab('agendas'));
  }, [dispatch]);

  const res = useSelector(state => state.res);

  const initialState = useMemo(
    () => ({
      searchValue: query.search || '',
      firstLoading: true,
      listLoading: true,
    }),
    [query.search]
  );

  const onAgendaSearch = useCallback(
    value => {
      history.push({
        ...history.location,
        search: qs.stringify({
          ...query,
          search: value !== '' ? value : undefined,
        }),
      });
    },
    [history, query]
  );

  const fieldProps = useMemo(
    () => ({
      placeholder: getLabel('searchAgenda'),
      classNameGroup: 'form-group search',
      className: 'form-control',
      autoComplete: 'off',
    }),
    [getLabel]
  );

  return (
    <div className="content">
      <AgendasSearch
        res={res.agendas.list}
        initialState={initialState}
        onSearch={onAgendaSearch}
        fieldProps={fieldProps}
        render={({ state, form, nextPage }) => {
          if (user.isNew && !state.total) {
            return <Welcome />;
          }

          if (state.firstLoading) {
            return <Spinner />;
          }

          return (
            <div>
              <div className="header">
                <div className="hidden-xs pull-right">
                  <Link
                    to={res.agendas.create}
                    className="btn btn-primary"
                    type="button"
                  >
                    {getLabel('createAgenda')}
                  </Link>
                </div>
              </div>

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

              {!state.firstLoading && !state.agendas.length ? (
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
                <div className="padding-v-md" style={{ position: 'relative' }}>
                  <Spinner />
                </div>
              ) : null}

              <Waypoint onEnter={nextPage} />
            </div>
          );
        }}
      />
    </div>
  );
}

export default hot(Agendas);
