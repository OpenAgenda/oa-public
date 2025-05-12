import { useIntl } from 'react-intl';
import { Box, Button } from '@openagenda/uikit';
import mapMessages from '@openagenda/react-filters/messages/map';

export interface SearchHereControlProps {
  searchHere: () => void;
}

export default function SearchHereControl({
  searchHere,
}: SearchHereControlProps) {
  const intl = useIntl();

  return (
    <Box
      position="absolute"
      bottom="20px"
      left="50%"
      transform="translateX(-50%)"
      whiteSpace="nowrap"
      zIndex="400"
    >
      <Button
        type="button"
        onClick={searchHere}
        outline="none"
        overflow="hidden"
        transitionDuration="0.2s"
        cursor="pointer"
        color="fg"
        background="white"
        height="24px"
        borderRadius="16px"
        padding="0px 12px"
        boxShadow="rgba(0, 0, 0, 0.16) 0px 2px 8px 0px"
        border="0px"
        _hover={{ backgroundColor: '#F3F3F3' }}
        _active={{ backgroundColor: '#EAEAEA' }}
      >
        {intl.formatMessage(mapMessages.searchHere)}
      </Button>
    </Box>
  );
}
