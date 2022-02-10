import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useApiClient, Spinner } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';

function AgendaItem({ agenda }) {
  const { getLabel } = useContext(I18nContext);

  return (
    <div className="agenda-item media" style={{ padding: '0' }}>
      <div className="media-left">
        <a href={`/${agenda.slug}`}>
          <img
            src={agenda.image}
            className="media-object ill avatar"
            style={{
              width: '50px',
              height: '50px',
            }}
            alt={agenda.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <a href={`/agendas/${agenda.uid}`}>
            <strong>{agenda.title}</strong>
          </a>

          {agenda.official ? (
            <span className="official">
              <i />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">
                  {getLabel('officialAgenda')}
                </div>
              </div>
            </span>
          ) : null}
        </div>
        <div className="actions">
          <a className="margin-right-xs" href={`/agendas/${agenda.uid}`}>
            {getLabel('see')}
          </a>
          <a href={`/agendas/${agenda.uid}/contribute`}>
            {getLabel('addAnEvent')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const res = useSelector(state => state.res);
  const { getLabel } = useContext(I18nContext);

  const apiClient = useApiClient();

  const twoWeekAgo = new Date();

  twoWeekAgo.setDate(twoWeekAgo.getDate() - 14);

  const agendasQuery = useQuery('welcome-agendas', () => apiClient.get('/agendas.json', {
    params: {
      sort: 'recentlyAddedEvents.desc',
      contributionType: 1,
      official: 1,
      limit: 5,
      updatedAt: {
        gte: twoWeekAgo,
      },
    },
  }));

  return (
    <div className="content">
      <div className="row">
        <div className="new-user">
          <h2 className="margin-v-md text-center">
            {getLabel('welcomeTitle')}
          </h2>

          <p>{getLabel('welcomeMessage')}</p>

          <h4 className="margin-v-md">{getLabel('contributeToExisting')}</h4>

          <form action="/agendas" method="GET" className="margin-top-sm">
            <input type="hidden" name="sort" value="recentlyAddedEvents.desc" />
            <input type="hidden" name="official" value="1" />
            <input type="hidden" name="contributionType" value="1" />

            <div className="form-group input-icon-right search">
              <div className="input-icon-right">
                <input
                  type="text"
                  name="search"
                  className="form-control"
                  placeholder={getLabel('searchAgenda')}
                />
                <button type="submit" className="btn">
                  <i className="fa fa-search" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>

          {agendasQuery.data?.agendas?.length ? (
            <>
              <p className="margin-top-md">{getLabel('openAgendasOfMoment')}</p>

              <ul className="list-group margin-top-sm">
                {agendasQuery.isLoading && !agendasQuery.data?.agendas ? (
                  <div style={{ position: 'relative', height: '50px' }}>
                    <Spinner />
                  </div>
                ) : null}

                {agendasQuery.data?.agendas
                  ? agendasQuery.data.agendas.map(agenda => (
                    <AgendaItem key={agenda.uid} agenda={agenda} />
                  ))
                  : null}

                <div className="margin-top-sm">
                  <a
                    href={`/agendas?sort=recentlyAddedEvents.desc&official=1&contributionType=1&updatedAt.gte=${
                      twoWeekAgo.toISOString().split('T')[0]
                    }`}
                  >
                    {getLabel('seeMore')}
                  </a>
                </div>
              </ul>
            </>
          ) : null}

          <h4 className="margin-v-md">{getLabel('orCreateYourAgenda')}</h4>

          <a href={res.agendas.create} className="btn btn-primary">
            {getLabel('createAgenda')}
          </a>
        </div>
      </div>
    </div>
  );
}
