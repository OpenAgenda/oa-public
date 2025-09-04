import { useIntl } from 'react-intl';
import { Flex, H4, Input, Link, List } from '@openagenda/uikit';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function GcalAccordionItem({ res }) {
  const intl = useIntl();

  return (
    <AccordionItem value="gcal" title="Google Agenda">
      <Flex gap="4" direction="column">
        <Input
          value={res.export.ics}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <H4>{intl.formatMessage(messages.instructions)}</H4>
        <List.Root as="ol" ps="5">
          <List.Item>
            {intl.formatMessage(messages.instructionsCopyLink, {
              link: (
                <Link
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  Google Calendar
                </Link>
              ),
            })}
          </List.Item>
          <List.Item>{intl.formatMessage(messages.gcalStep2)}</List.Item>
          <List.Item>{intl.formatMessage(messages.gcalStep3)}</List.Item>
        </List.Root>
      </Flex>
    </AccordionItem>
  );
}
