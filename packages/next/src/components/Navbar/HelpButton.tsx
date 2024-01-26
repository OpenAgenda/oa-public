import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import hrefWithLang from 'utils/hrefWithLang';
import { FaIcon } from 'icons';
import { faCircleQuestion } from 'icons/solid';
import messages from './messages';

export default function HelpButton() {
  const router = useRouter();
  const intl = useIntl();

  return (
    <Button
      as={Link}
      href={hrefWithLang(`/support?origin=${encodeURIComponent(router.asPath)}`, intl.locale)}
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
