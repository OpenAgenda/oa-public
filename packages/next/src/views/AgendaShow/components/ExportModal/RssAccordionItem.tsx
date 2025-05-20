import { useIntl } from 'react-intl';
import { Button, chakra } from '@openagenda/uikit';
import AccordionItem from 'components/AccordionItem';
import messages from './messages';

export default function RssAccordionItem({ handleSubmit }) {
  const intl = useIntl();

  return (
    <AccordionItem value="rss" title="RSS">
      <chakra.div textAlign="center">
        <Button type="submit" alignSelf="center" onClick={handleSubmit('rss')}>
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </chakra.div>
    </AccordionItem>
  );
}
