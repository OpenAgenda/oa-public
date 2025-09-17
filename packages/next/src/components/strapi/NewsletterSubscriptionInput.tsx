import { useIntl } from 'react-intl';
import {
  Field,
  Group,
  Input,
  InputGroup,
  Button,
  Icon,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faEnvelope } from 'icons/solid';
import messages from './messages';

type NewsletterSubscriptionInputProps = {
  fontColor?: string;
};

export default function NewsletterSubscriptionInput({
  fontColor = 'gray.100',
}: NewsletterSubscriptionInputProps) {
  const intl = useIntl();

  return (
    <form method="post" action="/newsletter/subscribe">
      <Field.Root>
        <Field.Label htmlFor="email" color={fontColor}>
          {intl.formatMessage(messages.newsletter)}
        </Field.Label>
        <Group attached>
          <InputGroup
            color={fontColor}
            startElement={
              <Icon color={fontColor}>
                <FaIcon icon={faEnvelope} />
              </Icon>
            }
          >
            <Input
              id="email"
              name="email"
              flex="1"
              size="sm"
              color={fontColor}
              borderRightRadius={0}
            />
          </InputGroup>
          <Button>{intl.formatMessage(messages.submit)}</Button>
        </Group>
      </Field.Root>
    </form>
  );
}
