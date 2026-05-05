import { useIntl } from 'react-intl';
import { chakra } from '@openagenda/uikit';
import messages from './messages';

export default function VisibilityContextBar({ agenda }) {
  const intl = useIntl();

  const getVisibilityMessage = () => {
    if (agenda.private === 1) {
      return intl.formatMessage(messages.private);
    }
    if (agenda.indexed === 1) {
      return intl.formatMessage(messages.indexed);
    }
    if (agenda.indexed === 0) {
      return intl.formatMessage(messages.unindexed);
    }
    return '';
  };

  return (
    <>
      <chakra.span display={{ base: 'none', md: 'inline-flex' }}>
        {intl.formatMessage(messages.visibility)}
        &nbsp;
      </chakra.span>
      <chakra.span fontWeight="bold">{getVisibilityMessage()}</chakra.span>
      &nbsp;&nbsp;&nbsp;&nbsp;
    </>
  );
}
