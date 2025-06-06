import { Heading, HeadingProps } from '@chakra-ui/react';

export function H1({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h1" size="5xl" {...props}>
      {children}
    </Heading>
  );
}

export function H2({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h2" size="4xl" {...props}>
      {children}
    </Heading>
  );
}

export function H3({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h3" size="3xl" {...props}>
      {children}
    </Heading>
  );
}

export function H4({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h4" size="xl" {...props}>
      {children}
    </Heading>
  );
}

export function H5({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h5" size="md" {...props}>
      {children}
    </Heading>
  );
}

export function H6({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h6" size="sm" {...props}>
      {children}
    </Heading>
  );
}
