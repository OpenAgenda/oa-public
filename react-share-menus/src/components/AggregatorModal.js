import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { debounce, throttle } from 'lodash';
import axios from 'axios';

import Modal from '@openagenda/react-shared/src/components/Modal';
import AgendasSearch from '@openagenda/react-shared/src/components/AgendasSearch';

const AggregatorModal = ({
  targetAgenda, onClose, res, success
}) => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noAgendas, setNoAgendas] = useState(false);
  const [page, setPage] = useState(1);
  const [initialTotal, setInitialTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [perPageLimit] = useState(20);

  const intl = useIntl();

  const messages = defineMessages({
    aggregatorTitle: {
      id: 'aggregator-title',
      defaultMessage: 'Aggregate to an agenda',
    },
    aggregatorDescription: {
      id: 'aggregator-description',
      defaultMessage: 'Events published by {targetAgenda} will be automatically added to the selected calendar.',
    },
    aggregatorSuccess: {
      id: 'aggregator-success',
      defaultMessage:
        "{targetAgenda} was successfully added as a source! \n {targetAgenda}'s events are being aggregated.",
    },
    noResult: {
      id: 'no-result',
      defaultMessage: 'No results',
    },
    noAgenda: {
      id: 'no-agenda',
      defaultMessage:
        "Warning: No agenda is administered by your account. Please create one first if you wish to aggregate {targetAgenda}'s events.",
    },
    createAgenda: {
      id: 'create-agenda',
      defaultMessage: 'Create an agenda',
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
      const defineParams = () => {
        if (action === 'next-page') return { role: 'administrator', search: searchText, page };
        return { role: 'administrator', search: searchText };
      };
      setLoading(true);
      const params = defineParams(searchText);
      const response = await axios.get(res, { params });
      setLoading(false);
      setTotal(response.data.total);
      const results = response.data.agendas.filter(agenda => agenda.slug !== targetAgenda.slug);
      if (action === 'next-page') {
        return setAgendas(prevAgendas => [...prevAgendas, ...results]);
      }
      return setAgendas(results);
    },
    [res, targetAgenda.slug, page]
  );

  useEffect(() => {
    if (!success) fetchAgendas('', 'next-page');
  }, [page, fetchAgendas, success]);

  useEffect(() => {
    async function fetchTotal() {
      const response = await axios.get(res, { params: { role: 'administrator', search: '' } });
      if (response.data.total === 0) {
        return setNoAgendas(true);
      }
      return setInitialTotal(response.data.total);
    }
    fetchTotal();
  }, [res]);

  const handleSubmit = e => {
    e.preventDefault();
    return onClose();
  };

  const getLabel = str => intl.formatMessage(messages[str]);

  const getTitleLink = agenda => `/${agenda.slug}/admin/sources?addSource=${targetAgenda.slug}&redirect=/${targetAgenda.slug}?aggregateSuccess=1`;

  const nextPage = () => {
    if (!agendas || !agendas.length || loading || page * perPageLimit >= total) return;
    return setPage(page + 1);
  };

  const debouncedSearch = debounce(fetchAgendas, 400);
  const throttledNextPage = throttle(nextPage, 400, { trailing: false });

  return (
    <div id="event">
      <Modal onClick={onClose} classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll>
        {success ? (
          <div className="export__form">
            <button className="export__close" type="button" onClick={onClose}>
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export__title--big">{intl.formatMessage(messages.aggregatorTitle)}</h1>
            <p className="margin-bottom-sm">
              {intl.formatMessage(messages.aggregatorSuccess, { targetAgenda: targetAgenda.title })}
            </p>
            <button className="btn btn-primary margin-bottom-sm" type="button" onClick={onClose}>
              OK
            </button>
          </div>
        ) : (
          <div className="export__form" onSubmit={handleSubmit}>
            <button className="export__close" type="button" onClick={onClose}>
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export__title--big">{intl.formatMessage(messages.aggregatorTitle)}</h1>
            <div className="padding-right-sm">
              <p className="text-muted">
                {intl.formatMessage(messages.aggregatorDescription, { targetAgenda: targetAgenda.title })}
              </p>
              <div className="search margin-top-md margin-bottom-sm">
                {noAgendas ? (
                  <>
                    <p>{intl.formatMessage(messages.noAgenda, { targetAgenda: targetAgenda.title })}</p>
                    <a className="btn btn-primary" href="https://openagenda.com/new">
                      {intl.formatMessage(messages.createAgenda)}
                    </a>
                  </>
                ) : (
                  <AgendasSearch
                    id="selectAgendasForAggregation"
                    getTitleLink={agenda => getTitleLink(agenda)}
                    getLabel={getLabel}
                    search={debouncedSearch}
                    agendas={agendas}
                    listLoading={loading}
                    nextPage={throttledNextPage}
                    fieldIsVisible={() => initialTotal > perPageLimit}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AggregatorModal;

AggregatorModal.propTypes = {
  res: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  targetAgenda: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
  }).isRequired,
  success: PropTypes.bool,
};

AggregatorModal.defaultProps = {
  success: false,
};
