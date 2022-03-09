import React, { createRef, useEffect, useReducer } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';
import { Spinner } from '@openagenda/react-shared';

import SearchInput from './SearchInput';

const messages = defineMessages({
  create: {
    id: 'AgendaLocations.LocationSearch.create',
    defaultMessage: 'Create a new location',
  },
  noResult: {
    id: 'AgendaLocations.LocationSearch.noResult',
    defaultMessage: 'No result match your entry',
  },
  namePlaceholder: {
    id: 'AgendaLocations.LocationSearch.namePlaceholder',
    defaultMessage: 'Type the name of the location of the event',
  },
  searching: {
    id: 'AgendaLocations.LocationSearch.searching',
    defaultMessage: 'Searching...',
  },
});

const initialState = init => ({
  showDropdown: false,
  page: 1,
  query: { search: init },
  from: 0,
  isLoading: false,
  locations: [],
  hasNext: false,
  hasPrev: false,
});

function reducer(state, action) {
  switch (action.type) {
    case 'setResult':
      return {
        ...state,
        locations: action.locations,
        isLoading: false,
        hasNext: action.hasNext,
        hasPrev: action.hasPrev
      };
    case 'setQuery':
      return {
        ...state,
        query: action.query,
      };
    case 'loading':
      return {
        ...state,
        isLoading: true,
      };
    case 'hideDropdown':
      return {
        ...state,
        showDropdown: false,
      };
    case 'showDropdown':
      return {
        ...state,
        showDropdown: true,
      };
    case 'adjacentPages':
      return {
        ...state,
        page: action.page,
        from: action.from,
      };
    default:
      return state;
  }
}

const LocationSearch = ({
  res,
  init = null,
  allowCreate,
  onCreateRequest,
  onSelect
}) => {
  const [state, dispatch] = useReducer(reducer, initialState(init));
  const intl = useIntl();

  const ref = createRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        dispatch({ type: 'hideDropdown' });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    dispatch({ type: 'loading' });
    axios.get(res.index, {
      params: {
        from: state.from,
        page: state.page,
        size: 10,
        search: state.query.search,
      }
    }).then(response => {
      dispatch({
        type: 'setResult',
        locations: response.data.items,
        hasNext: response.data.total > state.page * 10,
        hasPrev: state.page !== 1
      });
    });
  }, [state.query, state.from, state.page, res.index]);

  const onFocus = value => {
    dispatch({ type: 'setQuery', query: { search: value } });
    dispatch({ type: 'showDropdown' });
  };

  const getAdjacentPage = type => {
    dispatch({ type: 'adjacentPages', page: type === 'prev' ? state.page - 1 : state.page + 1, from: type === 'prev' ? state.from - 10 : state.from + 10 });
  };

  const renderEmpty = () => (<li className="no-search-result"><FormattedMessage {...messages.noResult} /></li>);

  const renderNav = type => {
    if (type === 'next' ? state.hasNext : state.hasPrev) {
      return <li className="nav-item" onClick={() => getAdjacentPage(type)}><i className="fa fa-ellipsis-h" /></li>;
    }
    return '';
  };

  const renderItem = l => (
    <li
      onClick={() => onSelect(l)}
      className="search-item"
      key={l.uid}
    >
      <div className="name">{l.name}</div>
      <div className="address">{l.address}</div>
    </li>
  );

  const renderCreateItem = () => {
    if (state.locations.length === 0) {
      return (
        <li
          className="no-search-button"
        >
          <button
            onClick={onCreateRequest.bind(null, state.query.search)}
            type="button"
            className="btn btn-primary"
          >
            <FormattedMessage {...messages.create} />
          </button>
        </li>
      );
    }
    return (
      <li
        className="search-item"
        onClick={onCreateRequest.bind(null, state.query.search)}
      >
        <div><FormattedMessage {...messages.create} /></div>
      </li>
    );
  };

  return (
    <div
      ref={ref}
      className={state.showDropdown ? 'dropdown open' : 'dropdown'}
    >
      <SearchInput
        initValue={init}
        placeholder={intl.formatMessage(messages.namePlaceholder)}
        onChange={v => dispatch({ type: 'setQuery', query: { search: v } })}
        onFocus={onFocus}
      />
      {state.isLoading ? (
        <Spinner
          mode="inline"
          loading
          message={intl.formatMessage(messages.searching)}
        />
      ) : null}
      <ul className="dropdown-menu">
        {renderNav('prev')}
        {state.locations.length ? state.locations.map(renderItem) : null}
        {renderNav('next')}
        {!state.locations.length ? renderEmpty() : null}
        {allowCreate ? renderCreateItem() : null}
      </ul>
    </div>
  );
};

export default LocationSearch;
