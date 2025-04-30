import { chakra, HTMLChakraProps, SystemStyleObject } from '@chakra-ui/react';

const charMap = {
  zeroWidthSpace: '\u200B',
  noBreak: '\u2060',
};

const styles: SystemStyleObject = {
  whiteSpace: 'nowrap',
};

interface NoBreakProps extends HTMLChakraProps<'span'> {
  char?: keyof typeof charMap;
}

export function NoBreak({
  char = 'zeroWidthSpace',
  children,
  ...props
}: NoBreakProps) {
  return (
    <chakra.span css={styles} {...props}>
      {charMap[char]}
      {children}
    </chakra.span>
  );
}
