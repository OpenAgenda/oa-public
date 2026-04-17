import { Flex } from '@openagenda/uikit';
import NavigateButton from './NavigateButton';

interface BottomNavigateButtonsProps {
  intl: any;
  messages: any;
}

export default function BottomNavigateButtons({
  intl,
  messages,
}: BottomNavigateButtonsProps) {
  return (
    <Flex
      as="nav"
      aria-label={intl.formatMessage(messages.eventNavigation)}
      justify="space-between"
      p={{ base: 4 }}
    >
      <NavigateButton direction="previous" overlapping={true} />
      <NavigateButton direction="next" overlapping={true} />
    </Flex>
  );
}
