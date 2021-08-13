import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'lodash';
import axios from 'axios';
import { defineMessages, useIntl } from 'react-intl';

import AgendasSearch from '@openagenda/react-shared/src/components/AgendasSearch';

const defineParams = ({
  searchText, filter, action, page
}) => {
  const query = {
    search: searchText
  };

  if (filter) {
    Object.assign(query, filter);
  }

  if (action === 'next-page') {
    query.page = page;
  }

  return query;
};

const AgendaSearchInput = ({
  targetAgenda, getTitleLink, segment, res, noAgendas, filter
}) => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [initialTotal, setInitialTotal] = useState(0);
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
    async (searchText = '', action = '') => {
      setLoading(true);

      const response = await axios.get(res, {
        params: defineParams({
          searchText, filter, action, page
        })
      });

      setLoading(false);
      setTotal(response.data.total);

      const results = response.data.agendas.filter(agenda => agenda.slug !== targetAgenda.slug);
      if (searchText === '' && segment && segment !== 'openagenda') {
        return setAgendas([]);
      }
      if (searchText !== '') {
        return setAgendas(results);
      }
      return setAgendas(prevAgendas => [...prevAgendas, ...results]);
    },
    [res, page, segment, targetAgenda.slug, filter]
  );

  useEffect(() => {
    if (!segment || segment === 'openagenda') fetchAgendas('', 'next-page');
  }, [segment, fetchAgendas]);

  // Fetch initial total of agendas to determine whether to show the search bar
  useEffect(() => {
    async function fetchTotal() {
      const response = await axios.get(res, { params: { role: 'administrator', search: '' } });
      if (response.data.total === 0) {
        return noAgendas(true);
      }
      return setInitialTotal(response.data.total);
    }
    fetchTotal();
  }, [res, noAgendas]);

  const nextPage = () => {
    if (!agendas || !agendas.length || loading || page * perPageLimit >= total) return;
    return setPage(page + 1);
  };

  const visibility = () => {
    if (!segment) return initialTotal > perPageLimit;
    return true;
  };

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
      fieldIsVisible={visibility}
    />
  );
};

export default AgendaSearchInput;

AgendaSearchInput.propTypes = {
  targetAgenda: PropTypes.shape({ title: PropTypes.string, slug: PropTypes.string }).isRequired,
  getTitleLink: PropTypes.func.isRequired,
  segment: PropTypes.string,
  res: PropTypes.string.isRequired,
  noAgendas: PropTypes.func,
  filter: PropTypes.shape({ role: PropTypes.string })
};

AgendaSearchInput.defaultProps = {
  segment: undefined,
  noAgendas: undefined,
  filter: undefined
};
