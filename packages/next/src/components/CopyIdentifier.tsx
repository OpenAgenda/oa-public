import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Input,
  InputGroup,
  Button,
  type InputProps,
  type InputGroupProps,
} from '@openagenda/uikit';
import copyText from 'utils/copyText';
import { FaIcon } from 'icons';
import { faClipboard, faCheck } from 'icons/solid';

const messages = defineMessages({
  copy: {
    id: 'next.components.CopyIdentifier.copy',
    defaultMessage: 'Copy identifier',
  },
  copied: {
    id: 'next.components.CopyIdentifier.copied',
    defaultMessage: 'Identifier copied',
  },
  clickToCopyIdentifier: {
    id: 'next.components.CopyIdentifier.clickToCopyIdentifier',
    defaultMessage: 'Click to copy the event identifier',
  },
});

interface CopyIdentifierProps extends Omit<InputGroupProps, 'children'> {
  identifier: number;
  size?: InputProps['size'];
}

export default function CopyIdentifier({
  identifier,
  size = 'md',
  ...rest
}: CopyIdentifierProps) {
  const intl = useIntl();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    copyText(identifier.toString());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 20000);
  }, [identifier]);

  return (
    <InputGroup
      {...rest}
      startAddon="UID"
      startAddonProps={{
        bg: 'primary.500',
        color: 'white',
      }}
      endElement={
        <Button
          colorPalette="gray"
          variant="ghost"
          size={size}
          type="submit"
          color={copied ? 'green.400' : 'fg.muted'}
          me="-3"
          onClick={copy}
          aria-label={
            copied
              ? intl.formatMessage(messages.copied)
              : intl.formatMessage(messages.copy)
          }
        >
          <FaIcon icon={copied ? faCheck : faClipboard} />
        </Button>
      }
    >
      <Input
        size={size}
        type="text"
        bg="white"
        value={identifier}
        cursor="pointer"
        onClick={copy}
        aria-label={intl.formatMessage(messages.clickToCopyIdentifier)}
      />
    </InputGroup>
  );
}
