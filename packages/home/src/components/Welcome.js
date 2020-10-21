import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import { Spinner } from '@openagenda/react-components';
import I18nContext from '../contexts/I18nContext';

function AgendaItem({ agenda }) {
  const { getLabel } = useContext(I18nContext);

  return (
    <div className="agenda-item media">
      <div className="media-left">
        <a href={`/${agenda.slug}`}>
          <img
            src={agenda.image}
            className="media-object ill avatar"
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
          <a href={`/agendas/${agenda.uid}`}>{getLabel('see')}</a>
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

  const agendasQuery = useQuery('welcome-agendas', () => apiClient.get('/agendas.json', {
    params: {
      sort: 'recentlyContributed.desc',
      contributionType: [1, 0],
      official: 1,
      limit: 5
    }
  }));

  return (
    <div className="content">
      <div className="row">
        <div className="new-user">
          <h2 className="margin-v-md text-center">
            {getLabel('welcomeTitle')}
          </h2>

          <p>{getLabel('welcomeMessage')}</p>

          <h4 className="margin-v-md text-center">
            {getLabel('contributeToExisting')}
          </h4>

          <form action="/agendas" method="GET" className="margin-top-sm">
            <input type="hidden" name="sort" value="recentlyContributed.desc" />
            <input type="hidden" name="official" value="1" />
            <input type="hidden" name="contributionType[]" value="1" />
            <input type="hidden" name="contributionType[]" value="0" />

            <div className="form-group input-icon-right search center-block">
              <div className="input-icon-right">
                <input type="text" name="search" className="form-control" />
                <button type="submit" className="btn">
                  <i className="fa fa-search" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>

          <p className="margin-top-md">{getLabel('openAgendasOfMoment')}</p>

          <ul className="list-group margin-top-sm">
            {agendasQuery.isLoading && !agendasQuery.data?.agendas ? (
              <div style={{ position: 'relative', height: '50px' }}>
                <Spinner />
              </div>
            ) : null}

            {agendasQuery.data?.agendas
              ? agendasQuery.data.agendas.map(agenda => (
                <AgendaItem agenda={agenda} />
              ))
              : null}

            <div className="margin-top-sm">
              <a href="/agendas?sort=recentlyContributed.desc&official=1&contributionType[]=1&contributionType[]=0">
                {getLabel('seeMore')}
              </a>
            </div>
          </ul>

          <h4 className="margin-v-md text-center">
            {getLabel('orCreateYourAgenda')}
          </h4>

          <div className="text-center">
            <a href={res.agendas.create} className="btn btn-primary">
              {getLabel('createAgenda')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
