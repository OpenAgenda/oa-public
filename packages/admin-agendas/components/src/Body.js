import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import qs from 'qs';
import get from '@openagenda/utils/get';
import post from '@openagenda/utils/post';
import { getSupportedLocale } from '@openagenda/intl';
import { Modal, AuthenticateAndConfirm, locales } from '@openagenda/react-shared';
import { IntlProvider } from 'react-intl';
import Details from '@openagenda/admin-agendas/components/src/Details';
import Search from './Search';

function getQuery() {
  return qs.parse(window.location.search, { ignoreQueryPrefix: true });
}

function updateHref(query) {
  const defaults = {
    searchPage: 1,
    membersPage: 1,
    tab: 'members'
  };

  const q = { ...defaults, ...query };

  // Nettoyage des paramètres superflus
  if (q.searchPage <= 1) delete q.searchPage;
  if (q.oas?.search === '') delete q.oas.search;
  if (q.membersPage <= 1) delete q.membersPage;
  if (q.tab === 'members') delete q.tab;

  const qStr = qs.stringify(q, { addQueryPrefix: true });
  window.history.pushState(q, '', window.location.pathname + qStr);
}

export default function Body(props) {
  const {
    searchRes,
    agendaRes,
    setAgendaRes,
    membersRes
  } = props;

  /**
   * État local
   */
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    query: {},
    agendas: [],
    total: 0,
    pageRange: [1, 1]
  });
  const [agenda, setAgenda] = useState({});
  const [members, setMembers] = useState([]);
  const [membersPageRange, setMembersPageRange] = useState([1, 1]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [displayDeleteModal, setDisplayDeleteModal] = useState(false);

  /**
   * Debounced search
   */
  const searchAgendas = useCallback(
    debounce((query, page, cb) => {
      setLoading(true);

      get(searchRes, query, (err, data) => {
        setLoading(false);

        if (err) {
          console.error('error', err);
          return;
        }

        // Mise à jour des agendas
        setSearch(prev => ({
          ...prev,
          agendas: data.agendas,
          total: data.total,
          pageRange: [parseInt(page, 10), parseInt(page, 10)]
        }));

        updateHref({ ...(getQuery() || {}), ...query });

        // Si on n'a qu'un seul résultat, on sélectionne directement cet agenda
        if (data.total === 1 && data.agendas[0]) {
          onSelectAgenda(data.agendas[0].uid);
        }

        if (cb) cb();
      });
    }, 500),
    [searchRes]
  );

  /**
   * Au montage : on arrête de loader puis on charge la première page (si agendas vide)
   */
  useEffect(() => {
    setLoading(false);

    const q = {
      searchPage: 1,
      agendaUid: null,
      agendaId: null,
      membersPage: 1,
      ...getQuery()
    };

    // Si aucune liste d'agendas, on déclenche une recherche initiale
    if (!search.agendas.length) {
      resetSearchPage(q.oas, q.searchPage, () => {
        if (q.agendaUid) {
          onSelectAgenda(q.agendaUid, q.membersPage);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fonctions utilitaires
   */
  function resetSearchPage(newQuery, page = 1, cb) {
    const query = {
      oas: newQuery,
      searchPage: page
    };

    // On met simplement à jour le search.query
    setSearch(prev => ({
      ...prev,
      query: newQuery
    }));

    // On lance la recherche "debounced"
    searchAgendas(query, page, cb);
  }

  function onSearchChange(name, searchValue) {
    // On ne se sert pas de `name` ici, mais on le laisse si besoin futur
    resetSearchPage({ search: searchValue });
  }

  function getSearchPage(next) {
    if (loading) return;

    // On calcule la page suivante/précédente
    const newPage = search.pageRange[next ? 1 : 0] + (next ? 1 : -1);
    const query = {
      oas: search.query,
      searchPage: newPage
    };

    // Si on a déjà chargé tous les agendas, on ne fait rien
    if (search.agendas.length >= search.total) return;

    setLoading(true);

    get(searchRes, query, (err, data) => {
      setLoading(false);
      if (err) {
        console.error('error', err);
        return;
      }

      setSearch(prev => {
        // Mise à jour du range
        const [start, end] = prev.pageRange;
        const newPageRange = next
          ? [start, end + 1]
          : [start - 1, end];

        // Ajout des nouvelles données
        const newAgendas = next
          ? [...prev.agendas, ...data.agendas]
          : [...data.agendas, ...prev.agendas];

        return {
          ...prev,
          agendas: newAgendas,
          pageRange: newPageRange,
          total: data.total // On remet éventuellement à jour le total
        };
      });

      updateHref({ ...(getQuery() || {}), ...query });
    });
  }

  function onSelectAgenda(uid, page = 1) {
    const query = {
      agendaUid: uid,
      membersPage: page
    };

    get(membersRes, query, (err, membersData) => {
      if (err) {
        console.error('error', err);
        return;
      }

      get(agendaRes.replace(':uid', uid), {}, (errAgenda, agendaData) => {
        if (errAgenda) {
          console.error('error', errAgenda);
          return;
        }

        setAgenda(agendaData);
        setMembers(membersData.members);
        setMembersTotal(membersData.total);
        setMembersPageRange([parseInt(page, 10), parseInt(page, 10)]);

        updateHref({ ...(getQuery() || {}), ...query });
      });
    });
  }

  function getMembersPage(next) {
    if (loading) return;

    const newPage = membersPageRange[next ? 1 : 0] + (next ? 1 : -1);
    const query = {
      agendaUid: agenda.uid,
      membersPage: newPage
    };

    // Si on a déjà chargé tous les membres, on ne fait rien
    if (members.length >= membersTotal) return;

    setLoading(true);

    get(membersRes, query, (err, data) => {
      setLoading(false);

      if (err) {
        console.error('error', err);
        return;
      }

      setMembersTotal(data.total);
      setMembersPageRange(prev => {
        const [start, end] = prev;
        return next ? [start, end + 1] : [start - 1, end];
      });

      setMembers(prev => {
        return next
          ? [...prev, ...data.members]
          : [...data.members, ...prev];
      });

      updateHref({ ...(getQuery() || {}), ...query });
    });
  }

  /**
   * Sauvegarde de l'agenda (en POST)
   */
  function saveAgenda(data) {
    return new Promise((resolve, reject) => {
      post(`${setAgendaRes}/${agenda.uid}`, data, (err, result) => {
        if (err) {
          return reject(err);
        }
        setAgenda(result);
        resolve(result);
      });
    });
  }

  function displayConfirmDelete() {
    setDisplayDeleteModal(true);
  }

  /**
   * Ajoute le superadmin courant comme administrateur de l'agenda sélectionné,
   * puis recharge la liste des membres.
   */
  function addMeAsAdmin() {
    return new Promise((resolve, reject) => {
      post(`${setAgendaRes}/${agenda.uid}/members/me`, {}, (err, result) => {
        if (err) {
          return reject(err);
        }
        onSelectAgenda(agenda.uid);
        resolve(result);
      });
    });
  }

  return (
    <IntlProvider
      key="fr"
      locale="fr"
      messages={locales.fr}
      defaultLocale={getSupportedLocale('fr')}
    >
      <div className="admin">
        <div className="container-fluid">
          <div className="row">
            <Search
              query={search.query}
              agendas={search.agendas}
              total={search.total}
              pageRange={search.pageRange}
              getSearchPage={getSearchPage}
              onSelectAgenda={onSelectAgenda}
              onSearchChange={onSearchChange}
              loading={loading}
            />
            <Details
              agenda={agenda}
              members={members}
              total={membersTotal}
              pageRange={membersPageRange}
              getMembersPage={getMembersPage}
              setAgenda={saveAgenda}
              addMeAsAdmin={addMeAsAdmin}
              displayConfirmDelete={displayConfirmDelete}
              updateHref={updateHref}
              getQuery={getQuery}
            />

            {displayDeleteModal && (
              <Modal
                onClose={() => setDisplayDeleteModal(false)}
                title="Suppression d'agenda"
              >
                <AuthenticateAndConfirm
                  method="delete"
                  message="MdP StP."
                  res={`/api/agendas/${agenda.uid}`}
                  onSuccess={() => {
                    window.location.href = '/admin/agendas';
                  }}
                />
              </Modal>
            )}
          </div>
        </div>
      </div>
    </IntlProvider>
  );
}
