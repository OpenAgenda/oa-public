import React from 'react';
import ReactFiltersMap from '@openagenda/react-filters/components/fields/MapField/Map';
import {
  gestureHandlingStyle,
  markerClusterStyle,
} from '@openagenda/react-filters/components/fields/MapField/mapStyle';
import wrapFilter from '../../wrapFilter';

const StyledMap = wrapFilter(ReactFiltersMap);

export default function Map({ innerRef, filter, ...props }) {
  return (
    <StyledMap
      ref={innerRef}
      forwardedFilter={filter} // filter is a valid CSS prop, it breaks chakra :'(
      {...props}
      sx={{
        h: 'full',
        ...markerClusterStyle,
        ...gestureHandlingStyle,
      }}
    />
  );
}
