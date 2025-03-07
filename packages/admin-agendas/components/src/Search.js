import React, { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Spinner } from '@openagenda/react-shared';
import AgendaItem from '@openagenda/admin-agendas/components/src/AgendaItem';

const searchSpinnerConfig = {
  width: 1,
  length: 3,
  radius: 4
};

export default function Search({
  query,
  agendas,
  loading,
  onSelectAgenda,
  onSearchChange,
  getSearchPage,
}) {
  const searchRef = useRef(null);

  const { ref: infiniteRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !loading) {
      getSearchPage(true);
    }
  }, [inView, loading, getSearchPage]);

  return (
    <div className="col-md-3 admin-search" ref={searchRef}>
      <div className="row">
        <div className="header">
          <div className="form-group">
            <label className="sr-only" htmlFor="agenda_search">
              Recherche d'agendas
            </label>
            <div className="input-icon-right">
              <input
                title="je mange des urls et des uid aussi maintenant"
                className="form-control"
                placeholder="Rechercher"
                value={query?.search || ''}
                onChange={(e) => onSearchChange('oas[search]', e.target.value)}
              />
              <button type="submit" className="btn">
                {loading ? (
                  <Spinner options={searchSpinnerConfig} />
                ) : (
                  <i className="fa fa-search" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="body media-list">
          {agendas?.length ? (
            agendas.map((agenda) => (
              <AgendaItem
                key={agenda.uid}
                agenda={agenda}
                onSelect={onSelectAgenda}
              />
            ))
          ) : (
            <div className="empty">
              <p>Aucun agenda correspondant à cette recherche</p>
            </div>
          )}
          <div ref={infiniteRef} />
        </div>
      </div>
    </div>
  );
};
