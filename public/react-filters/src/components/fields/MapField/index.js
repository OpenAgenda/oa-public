import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import LoadableMap from './LoadableMap';

const messages = defineMessages({
  searchWithMap: {
    id: 'ReactFilters.MapField.searchWithMap',
    defaultMessage: 'Search with map',
  },
});

function MapField(
  {
    input,
    collapsed,
    name,
    filter,
    tileAttribution,
    tileUrl,
    loadGeoData,
    initialViewport,
    defaultViewport,
    mapClass,
    searchMessage,
    searchWithMap,
  },
  ref
) {
  const intl = useIntl();
  const seed = useUIDSeed();
  const [userControlled, setUserControlled] = useState(
    () => (typeof searchWithMap === 'boolean' ? searchWithMap : !!input.value)
  );
  const toggleUserControlled = useCallback(
    e => setUserControlled(e.target.checked),
    []
  );

  const onChange = useCallback(
    value => {
      if (!userControlled) {
        if (value) {
          loadGeoData(filter, value.bounds, value.zoom).then(data => ref.current.setData(data?.reverse() ?? []));
        }

        return input.onChange(undefined);
      }

      const northEast = value.bounds.getNorthEast().wrap();
      const southWest = value.bounds.getSouthWest().wrap();

      input.onChange({
        northEast: {
          lat: northEast.lat,
          lng: northEast.lng,
        },
        southWest: {
          lat: southWest.lat,
          lng: southWest.lng,
        },
      });
    },
    [filter, input, loadGeoData, ref, userControlled]
  );

  return !collapsed ? (
    <>
      <div className={mapClass}>
        <LoadableMap
          ref={ref}
          input={input}
          filter={filter}
          tileAttribution={tileAttribution}
          tileUrl={tileUrl}
          loadGeoData={loadGeoData}
          initialViewport={initialViewport}
          defaultViewport={defaultViewport}
          onChange={onChange}
          userControlled={userControlled}
          setUserControlled={setUserControlled}
        />
      </div>

      <div className="checkbox">
        <label htmlFor={seed('input')}>
          <input
            name={`${name}-userControlled`}
            type="checkbox"
            id={seed('input')}
            checked={userControlled}
            onChange={toggleUserControlled}
          />{' '}
          {searchMessage || intl.formatMessage(messages.searchWithMap)}
        </label>
      </div>
    </>
  ) : null;
}

export default React.forwardRef(MapField);
