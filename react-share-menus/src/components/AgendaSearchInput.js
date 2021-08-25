import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'lodash';
import axios from 'axios';
import { defineMessages, useIntl } from 'react-intl';

import AgendasSearch from '@openagenda/react-shared/src/components/AgendasSearch';

const defineParams = ({
  searchText, filter, page
}) => {
  const query = {
    search: searchText
  };

  if (filter) {
    Object.assign(query, filter);
  }

  if (page > 1) {
    query.page = page;
  }

  return query;
};

const AgendaSearchInput = ({
  targetAgenda, getTitleLink, preFetchAgendas, res, filter, noAgendas
}) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPageLimit] = useState(20);

  const intl = useIntl();

  const messages = defineMessages({
    noAgenda: {
      id: 'no-agenda',
      defaultMessage:
        "Warning: No agenda is administered by your account. Please create one first if you wish to aggregate {targetAgenda}'s events.",
    },
    searchAgenda: {
      id: 'search-agenda',
      defaultMessage: 'Search',
    },
    officialAgenda: {
      id: 'official-agenda',
      defaultMessage: 'Official agenda',
    },
    privateAgenda: {
      id: 'private-agenda',
      defaultMessage: 'Private agenda',
    },
  });

  const fetchAgendas = useCallback(
    async (searchText = '', pageToLoad = 1) => {
      setSearch(searchText);
      setLoading(true);
      const response = await axios.get(res, {
        params: defineParams({
          searchText,
          filter,
          page: pageToLoad,
        }),
      });

      const results = response.data.agendas.filter(agenda => agenda.slug !== targetAgenda.slug);

      setLoading(false);
      setTotal(response.data.total);

      if (searchText === '' && results.length === 0 && noAgendas) {
        setVisibility(false);
        return noAgendas(true);
      }

      if (searchText === '' && response.data.total < perPageLimit && response.data.total > 1) {
        setVisibility(false);
      }

      if (searchText === '' && !preFetchAgendas) {
        return setAgendas([]);
      }
      return setAgendas(prevAgendas => (pageToLoad > 1 ? [...prevAgendas, ...results] : results));
    },
    [filter, res, preFetchAgendas, targetAgenda.slug, noAgendas, perPageLimit]
  );

  useEffect(() => {
    if (preFetchAgendas && initialLoad) {
      fetchAgendas('');
      setInitialLoad(false);
    }
  }, [preFetchAgendas, initialLoad, fetchAgendas]);

  const nextPage = () => {
    if (!agendas || !agendas.length || loading || page * perPageLimit >= total) return;
    setPage(page + 1);
    fetchAgendas(search, page + 1);
  };

  const handleVisibility = () => visibility;

  const getLabel = str => {
    if (str === 'noResult') return '';
    return intl.formatMessage(messages[str]);
  };

  const debouncedSearch = debounce(fetchAgendas, 400);
  const throttledNextPage = throttle(nextPage, 400, { trailing: false });

  return (
    <AgendasSearch
      id="selectAgendasForSharing"
      getTitleLink={getTitleLink}
      getLabel={getLabel}
      listLoading={loading}
      search={debouncedSearch}
      agendas={agendas}
      nextPage={throttledNextPage}
      fieldIsVisible={handleVisibility}
    />
  );
};

export default AgendaSearchInput;

AgendaSearchInput.propTypes = {
  targetAgenda: PropTypes.shape({ title: PropTypes.string, slug: PropTypes.string }).isRequired,
  getTitleLink: PropTypes.func.isRequired,
  preFetchAgendas: PropTypes.bool,
  res: PropTypes.string.isRequired,
  noAgendas: PropTypes.func,
  filter: PropTypes.shape({ role: PropTypes.string }),
};

AgendaSearchInput.defaultProps = {
  preFetchAgendas: false,
  noAgendas: undefined,
  filter: undefined,
};
