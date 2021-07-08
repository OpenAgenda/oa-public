import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { debounce, throttle } from 'lodash';
import axios from 'axios';

import Modal from '@openagenda/react-shared/src/components/Modal';
import AgendasSearch from '@openagenda/react-shared/src/components/AgendasSearch';

const AggregatorModal = ({ targetAgenda, onClose, res }) => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAgendas = useCallback(async (searchText = '', action = '') => {
    const defineParams = () => {
      if (action === 'next-page') return { role: 'administrator', searchText, page };
      return { role: 'administrator', search: searchText };
    };
    setLoading(true);
    const params = defineParams(searchText);
    const response = await axios.get(res, { params });
    setLoading(false);
    setTotal(response.data.total);
    const results = response.data.agendas.filter(agenda => agenda.slug !== targetAgenda.slug);
    if (action === 'next-page') {
      return setAgendas([...agendas, ...results]);
    }
    return setAgendas(results);
  }, [res, targetAgenda.slug, page]);

  /* const fetchAgendas = async (searchText = '') => {}; */

  useEffect(() => {
    fetchAgendas('', 'next-page');
  }, [page, fetchAgendas]);

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
    cancel: {
      id: 'cancel',
      defaultMessage: 'Cancel',
    },
    noResult: {
      id: 'no-result',
      defaultMessage: 'No results',
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
      defaultMessage: 'Private agenda'
    }
  });

  const handleSubmit = e => {
    e.preventDefault();
    return onClose();
  };

  const getLabel = str => intl.formatMessage(messages[str]);

  const getTitleLink = agenda => `/${agenda.slug}/admin/sources?addSource=${targetAgenda.slug}&redirect=/${targetAgenda.slug}/actions`;

  const nextPage = () => {
    if (!agendas || !agendas.length || loading || page * 20 >= total) return;
    setPage(page + 1);
  };

  const debouncedSearch = debounce(fetchAgendas, 400);
  const throttledNextPage = throttle(nextPage, 400, { trailing: false });

  return (
    <div id="event">
      <Modal onClick={onClose} classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll>
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
              <AgendasSearch
                id="selectAgendasForAggregation"
                getTitleLink={agenda => getTitleLink(agenda)}
                getLabel={getLabel}
                search={debouncedSearch}
                agendas={agendas}
                listLoading={loading}
                nextPage={throttledNextPage}
              />
            </div>
            <div className="margin-bottom-sm margin-top-sm">
              <button type="button" className="btn btn-link text-danger cancel-button-left" onClick={onClose}>
                {intl.formatMessage(messages.cancel)}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AggregatorModal;

AggregatorModal.propTypes = {
  res: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  targetAgenda: PropTypes.object,
};
