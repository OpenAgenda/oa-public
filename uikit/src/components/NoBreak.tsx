import { chakra, HTMLChakraProps, SystemStyleObject } from '@chakra-ui/react';

const charMap = {
  zeroWidthSpace: '\u200B',
  noBreak: '\u2060',
};

interface NoBreakProps extends HTMLChakraProps<'span'> {
  char?: keyof typeof charMap;
}

export function NoBreak({
  char = 'zeroWidthSpace',
  children,
  ...props
}: NoBreakProps) {
  const styles: SystemStyleObject = {
    whiteSpace: 'nowrap',
  };

  return (
    <chakra.span __css={styles} {...props}>
      {charMap[char]}
      {children}
    </chakra.span>
  );
}
