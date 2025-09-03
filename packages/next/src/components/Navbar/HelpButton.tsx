import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faCircleQuestion } from 'icons/solid';
import messages from './messages';

export default function HelpButton() {
  const intl = useIntl();

  return (
    <Button
      asChild
      variant="outline"
      borderRadius="full"
      mx="4"
      alignSelf="center"
      transitionDuration="fast"
    >
      <Link
        unstyled
        href="https://doc.openagenda.com"
        target="_blank"
        rel="noopener"
      >
        <FaIcon icon={faCircleQuestion} size="lg" />
        {intl.formatMessage(messages.help)}
      </Link>
    </Button>
  );
}
