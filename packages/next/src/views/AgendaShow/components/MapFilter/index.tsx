import React from 'react';
import dynamic from 'next/dynamic';
import {
  MapFilter as ReactFiltersMapFilter,
  useMapUserControl,
  useMapOnChange,
} from '@openagenda/react-filters';
import { chakra, Box } from '@openagenda/uikit';
import SearchWithMap from './SearchWithMap';

type SetUserControlled = (userControlled: boolean) => void;
type ToggleUserControlled = () => void;
type UseMapUserControl = (name: string, searchWithMap: string) => [boolean, SetUserControlled, ToggleUserControlled];

const DynamicMap = dynamic(() => import('./Map'), { ssr: false });

const StyledSearchWithMap = chakra(SearchWithMap);

const MapField = React.forwardRef<any, any>(function MapField(
  {
    input,
    name,
    filter,
    tileAttribution,
    tileUrl,
    loadGeoData,
    initialViewport,
    defaultViewport,
    searchMessage,
    searchWithMap,
  },
  ref,
) {
  const [userControlled, setUserControlled, toggleUserControlled] = (useMapUserControl as UseMapUserControl)(name, searchWithMap);
  const onChange = useMapOnChange({ filter, input, loadGeoData, ref, userControlled });

  return (
    <div>
      <Box h="250px">
        <DynamicMap
          innerRef={ref}
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
      </Box>

      <StyledSearchWithMap
        name={name}
        userControlled={userControlled}
        toggleUserControlled={toggleUserControlled}
        searchMessage={searchMessage}
        mt="1"
      />
    </div>
  );
});

const MapFilter = React.forwardRef<any, any>(function MapFilter({
  name,
  filter,
  disabled,
  className,
  ...rest
}, ref) {
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
