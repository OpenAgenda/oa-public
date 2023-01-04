import { useIntl } from 'react-intl';
import { Checkbox } from '@openagenda/uikit';
import mapMessages from '@openagenda/react-filters/messages/map';

export interface SearchWithMapProps {
  name: string;
  userControlled: boolean;
  toggleUserControlled: () => void;
  searchMessage?: string;
  className?: string;
}

export default function SearchWithMap({
  name,
  userControlled,
  toggleUserControlled,
  searchMessage,
  className,
}: SearchWithMapProps) {
  const intl = useIntl();

  return (
    <label htmlFor="map-filter-2" className={className}>
      <Checkbox
        name={`${name}-userControlled`}
        isChecked={userControlled}
        onChange={toggleUserControlled}
        colorScheme="primary"
      >
        {searchMessage || intl.formatMessage(mapMessages.searchWithMap)}
      </Checkbox>
    </label>
  );
}
