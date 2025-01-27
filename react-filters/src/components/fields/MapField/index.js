import React from 'react';
import { css } from '@emotion/react';
import cn from 'classnames';
import LoadableMap from './LoadableMap.js';
import { gestureHandlingStyle, markerClusterStyle } from './mapStyle.js';

// x remettre la carte en face des marqueurs après une recherche
// x Submit au click du lien en mode manual
// disabled sur le lien

const mapContainerStyle = css`
  position: relative;
`;

const mapStyle = css`
  height: 100%;
  ${markerClusterStyle}
  ${gestureHandlingStyle}
`;

function MapField(
  {
    input,
    collapsed,
    // name,
    filter,
    tileAttribution,
    tileUrl,
    loadGeoData,
    initialViewport,
    defaultViewport,
    className,
    mapClass,
  },
  ref,
) {
  return !collapsed ? (
    <div css={mapContainerStyle} className={cn(className, mapClass)}>
      <LoadableMap
        ref={ref}
        input={input}
        filter={filter}
        tileAttribution={tileAttribution}
        tileUrl={tileUrl}
        loadGeoData={loadGeoData}
        initialViewport={initialViewport}
        defaultViewport={defaultViewport}
        css={mapStyle}
      />
    </div>
  ) : null;
}

export default React.forwardRef(MapField);
