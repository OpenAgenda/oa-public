import { useIntl } from 'react-intl';
import { chakra, Link } from '@openagenda/uikit';
import useEvent from '../hooks/useEvent';
import { footer as messages } from '../messages';

export default function Footer() {
  const intl = useIntl();
  const { event } = useEvent();

  return (
    <footer>
      <Link href="/" colorScheme="primary">
        OpenAgenda
      </Link>
      {' · '}
      <Link href="https://doc.openagenda.com" isExternal colorScheme="primary">
        {intl.formatMessage(messages.help)}
      </Link>
      {' · '}
      <Link href="https://doc.openagenda.com/conditions/" colorScheme="primary">
        {intl.formatMessage(messages.termsOfUse)}
      </Link>
      {' · '}
      <chakra.span color="oaGray.500">&lt;uid:{event.uid}&gt;</chakra.span>
    </footer>
  );
}
