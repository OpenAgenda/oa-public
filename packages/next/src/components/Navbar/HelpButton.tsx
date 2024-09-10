import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faCircleQuestion } from 'icons/solid';
import messages from './messages';

export default function HelpButton() {
  const intl = useIntl();

  return (
    <Button
      as={Link}
      href="https://doc.openagenda.com"
      target="_blank"
      rel="noreferrer"
      variant="outline"
      colorScheme="primary"
      borderRadius="full"
      mx="4"
      alignSelf="center"
      leftIcon={<FaIcon icon={faCircleQuestion} size="lg" />}
      transitionDuration="fast"
      _hover={{
        color: 'white',
        bg: 'primary.500',
        textDecoration: 'none',
      }}
      _active={{
        color: 'white',
        bg: 'primary.500',
        textDecoration: 'none',
      }}
    >
      {intl.formatMessage(messages.help)}
    </Button>
  );
}
