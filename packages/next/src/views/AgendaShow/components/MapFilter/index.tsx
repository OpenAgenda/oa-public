import React from 'react';
import dynamic from 'next/dynamic';
import { MapFilter as ReactFiltersMapFilter } from '@openagenda/react-filters';
import { Box } from '@openagenda/uikit';
import SearchHereControl from './SearchHereControl';

const DynamicMap = dynamic(() => import('./Map'), { ssr: false });

const MapField = React.forwardRef<any, any>(function MapField(
  {
    input,
    filter,
    tileAttribution,
    tileUrl,
    loadGeoData,
    initialViewport,
    defaultViewport,
  },
  ref,
) {
  return (
    <Box h="250px" pos="relative">
      <DynamicMap
        innerRef={ref}
        input={input}
        filter={filter}
        tileAttribution={tileAttribution}
        tileUrl={tileUrl}
        loadGeoData={loadGeoData}
        initialViewport={initialViewport}
        defaultViewport={defaultViewport}
        searchHereControl={SearchHereControl}
      />
    </Box>
  );
});

const MapFilter = React.forwardRef<any, any>(function MapFilter(
  { name, filter, disabled, className, ...rest },
  ref,
) {
  return (
    <ReactFiltersMapFilter
      name={name}
      filter={filter}
      disabled={disabled}
      className={className}
      component={MapField}
      ref={ref}
      {...rest}
    />
  );
});

export default MapFilter;
