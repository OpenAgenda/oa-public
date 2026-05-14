import { useCallback, useEffect, useState, createRef } from 'react';
import { useDebounce } from 'use-debounce';
import cn from 'classnames';
import qs from 'qs';
import { Spinner } from '@openagenda/react-shared';
import { useIntl } from 'react-intl';
import EventItem from './EventItem.js';
import messages from './messages.js';
import includeFields from './includeFields.json' with { type: 'json' };

export default function Add({ res, value, lang, onChange }) {
  const [searchString, setSearchString] = useState('');
  const [userHasSearched, setUserHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState(undefined);
  const [debouncedSearch] = useDebounce(searchString, 1000);
  const [isLoading, setIsLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const m = useIntl().formatMessage;

  useEffect(() => {
    if (!userHasSearched) {
      return;
    }
    setIsLoading(true);
    fetch(
      `${res}?${qs.stringify({
        search: debouncedSearch,
        state: [0, 1, 2],
        relative: ['current', 'upcoming'],
        includeFields,
      })}`,
    ).then((response) => {
      setIsLoading(false);
      if (!response.ok) {
        setErrored(true);
        return;
      }
      setDisplayDropdown(true);
      response.json().then(setSearchResult);
    });
  }, [debouncedSearch, res, userHasSearched]);

  const onSearchChange = useCallback(
    (e) => {
      setSearchString(e.target.value);
      if (!userHasSearched && e.target.value?.length) {
        setUserHasSearched(true);
      }
    },
    [userHasSearched],
  );

  const ref = createRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setDisplayDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  if (errored) {
    return <p>{m(messages.loadError)}</p>;
  }

  return (
    <div className={cn('dropdown', { open: displayDropdown })}>
      <div className="input-group">
        <label className="sr-only" htmlFor="search">
          {m(messages.searchEvents)}
        </label>
        <input
          id="search"
          type="text"
          className="form-control"
          placeholder={m(messages.searchEvents)}
          autoComplete="off"
          onChange={onSearchChange}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-default"
            type="button"
            aria-label={m(messages.search)}
          >
            <i
              className="fa fa-search"
              aria-hidden="true"
              style={{ display: 'block', height: '20px', paddingTop: '4px' }}
            />
          </button>
        </span>
      </div>
      {isLoading ? <Spinner /> : null}
      {displayDropdown ? (
        <ul ref={ref} className="dropdown-menu">
          {!(searchResult?.events ?? []).length ? (
            <li className="padding-v-sm" key="search-result-empty">
              <div className="media text-center disabled">
                {m(messages.noResult)}
              </div>
            </li>
          ) : null}
          {(searchResult?.events ?? []).map((event) => (
            <li className="padding-v-sm" key={`search-result-${event.uid}`}>
              <div className="media">
                <button
                  type="button"
                  className="btn btn-link btn-block"
                  onClick={() => {
                    onChange((value ?? []).concat(event.uid));
                    setDisplayDropdown(false);
                  }}
                  disabled={(value ?? []).includes(event.uid)}
                >
                  <EventItem lang={lang} event={event} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
