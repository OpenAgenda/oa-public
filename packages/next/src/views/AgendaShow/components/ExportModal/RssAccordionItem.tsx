import { useIntl } from 'react-intl';
import { Button, chakra } from '@openagenda/uikit';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function RssAccordionItem({ handleSubmit }) {
  const intl = useIntl();

  return (
    <AccordionItem title="RSS">
      <chakra.div textAlign="center">
        <Button type="submit" colorScheme="primary" alignSelf="center" onClick={handleSubmit('rss')}>
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </chakra.div>
    </AccordionItem>
  );
}
