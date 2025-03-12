import { useIntl } from 'react-intl';
import {
  Flex,
  H4,
  Input,
  Link,
  ListItem,
  OrderedList,
} from '@openagenda/uikit';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function OutlookAccordionItem({ res }) {
  const intl = useIntl();

  return (
    <AccordionItem title="Outlook">
      <Flex gap="4" direction="column">
        <Input
          value={res.export.ics}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <H4>{intl.formatMessage(messages.instructions)}</H4>
        <OrderedList>
          <ListItem>
            {intl.formatMessage(messages.instructionsCopyLink, {
              link: (
                <Link
                  href="https://outlook.com"
                  target="_blank"
                  rel="noopener nofollow"
                  colorScheme="primary"
                >
                  Outlook
                </Link>
              ),
            })}
          </ListItem>
          <ListItem>{intl.formatMessage(messages.outlookStep2)}</ListItem>
          <ListItem>{intl.formatMessage(messages.outlookStep3)}</ListItem>
          <ListItem>{intl.formatMessage(messages.outlookStep4)}</ListItem>
          <ListItem>{intl.formatMessage(messages.outlookStep5)}</ListItem>
        </OrderedList>
      </Flex>
    </AccordionItem>
  );
}
