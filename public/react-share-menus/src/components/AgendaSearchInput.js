import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'lodash';
import axios from 'axios';
import { defineMessages, useIntl } from 'react-intl';
import { Form, Field } from 'react-final-form';
import { AgendasSearch } from '@openagenda/react-shared';

import {
  reset as resetNav,
  defineParams,
  loadNext as loadNextNav,
  isStart as isNavStart,
} from './lib/navState';

const appendNewAgendas = (agendas, newAgendas) => {
  const appended = [...agendas];
  newAgendas.forEach((n) => {
    if (agendas.some((a) => a.uid === n.uid)) {
      return;
    }
    appended.push(n);
  });

  return appended;
};

const AgendaSearchInput = (props) => {
  const {
    targetAgenda,
    getTitleLink,
    preFetchAgendas,
    noAgendas,
    res,
    perPageLimit,
    filter,
  } = props;

  const [initialLoad, setInitialLoad] = useState(true);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [nav, setNav] = useState(resetNav({ res, perPageLimit, filter }));

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
    async (navPatch) => {
      setLoading(true);

      const updatedNav = navPatch ? { ...nav, ...navPatch } : nav;

      if (navPatch) {
        setNav(updatedNav);
      }

      const response = await axios.get(updatedNav.currentRes, {
        params: defineParams(updatedNav),
      });

      const results = response.data.agendas.filter(
        (agenda) => agenda.slug !== targetAgenda.slug,
      );

      setLoading(false);

      updatedNav.total = response.data.total;

      setNav(updatedNav);

      const emptySearchString = updatedNav.search === '';

      if (emptySearchString && results.length === 0 && noAgendas) {
        setVisibility(false);
        return noAgendas(true);
      }

      if (emptySearchString && !preFetchAgendas) {
        return setAgendas([]);
      }

      if (
        isNavStart(updatedNav)
        && results.length < nav.perPageLimit
        && Array.isArray(res)
      ) {
        fetchAgendas(loadNextNav(updatedNav));
      }

      return setAgendas((prevAgendas) =>
        (isNavStart(updatedNav)
          ? results
          : appendNewAgendas(prevAgendas, results)));
    },
    [preFetchAgendas, targetAgenda.slug, noAgendas, nav, res],
  );

  useEffect(() => {
    if (preFetchAgendas && initialLoad) {
      fetchAgendas('');
      setInitialLoad(false);
    }
  }, [preFetchAgendas, initialLoad, fetchAgendas]);

  const nextPage = () => {
    if (loading) {
      return false;
    }

    const nextNav = loadNextNav(nav);

    if (!nextNav) {
      return false;
    }

    fetchAgendas(nextNav);
  };

  const handleVisibility = () => visibility;

  const getLabel = (str) => {
    if (str === 'noResult') return '';
    return intl.formatMessage(messages[str]);
  };

  const debouncedSearch = debounce((search) => {
    fetchAgendas(resetNav({ ...props, search }));
  }, 400);

  const throttledNextPage = throttle(nextPage, 400, { trailing: false });

  return (
    <AgendasSearch
      id="selectAgendasForSharing"
      Form={Form}
      Field={Field}
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
  targetAgenda: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
  }).isRequired,
  getTitleLink: PropTypes.func.isRequired,
  preFetchAgendas: PropTypes.bool,
  perPageLimit: PropTypes.number,
  res: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  noAgendas: PropTypes.func,
  filter: PropTypes.shape({ role: PropTypes.string }),
};

AgendaSearchInput.defaultProps = {
  perPageLimit: 20,
  preFetchAgendas: false,
  noAgendas: undefined,
  filter: undefined,
};
