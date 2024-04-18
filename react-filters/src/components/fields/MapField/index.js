import React from 'react';
import { css } from '@emotion/react';
import { useMapUserControl, useMapOnChange } from '../../../hooks';
import LoadableMap from './LoadableMap';
import SearchWithMap from './SearchWithMap';
import { gestureHandlingStyle, markerClusterStyle } from './mapStyle';

const mapStyle = css`
  height: 100%;
  ${markerClusterStyle}
  ${gestureHandlingStyle}
`;

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
  ref,
) {
  const [userControlled, setUserControlled, toggleUserControlled] = useMapUserControl(name, searchWithMap);
  const onChange = useMapOnChange({ input, loadGeoData, ref, userControlled });

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
          css={mapStyle}
        />
      </div>

      <SearchWithMap
        name={name}
        userControlled={userControlled}
        toggleUserControlled={toggleUserControlled}
        searchMessage={searchMessage}
      />
    </>
  ) : null;
}

export default React.forwardRef(MapField);
