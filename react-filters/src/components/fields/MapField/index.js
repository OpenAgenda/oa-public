import React from 'react';
import cn from 'classnames';
import Style from '../../Style.js';
import LoadableMap from './LoadableMap.js';

// x remettre la carte en face des marqueurs après une recherche
// x Submit au click du lien en mode manual
// disabled sur le lien

// Class repeated to outrank the consumer classes merged in below.
const css = `
.oa-filters-map-container.oa-filters-map-container {
  position: relative;
}
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
    <div className={cn('oa-filters-map-container', className, mapClass)}>
      <Style name="MapField">{css}</Style>
      <LoadableMap
        ref={ref}
        input={input}
        filter={filter}
        tileAttribution={tileAttribution}
        tileUrl={tileUrl}
        loadGeoData={loadGeoData}
        initialViewport={initialViewport}
        defaultViewport={defaultViewport}
      />
    </div>
  ) : null;
}

export default React.forwardRef(MapField);
