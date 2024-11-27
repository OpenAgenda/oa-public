import { useCallback, useState } from 'react';

import {
  Input,
  InputGroup,
  InputRightElement,
  InputLeftAddon,
  Button,
  Box,
} from '@openagenda/uikit';

import copyText from 'utils/copyText';

import { FaIcon } from 'icons';

import { faClipboard, faCheck } from 'icons/solid';

interface CopyIdentifierProps {
  identifier: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function CopyIdentifier({
  identifier,
  size = 'md',
}: CopyIdentifierProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    copyText(identifier);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 20000);
  }, [identifier]);

  return (
    <Box maxW="220px" align="left">
      <InputGroup size={size}>
        <InputLeftAddon bg="primary.500" color="white">
          UID
        </InputLeftAddon>
        <Input
          type="text"
          bg="white"
          value={identifier}
          cursor="pointer"
          onClick={copy}
        />
        <InputRightElement>
          <Button
            variant="ghost"
            type="submit"
            color={copied ? 'green.400' : undefined}
            onClick={copy}
          >
            <FaIcon icon={copied ? faCheck : faClipboard} />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}
