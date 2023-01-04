import { UrlObject } from 'url';
import React, { PropsWithChildren } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@openagenda/uikit';

export type NextChakraLinkProps = PropsWithChildren<
  Omit<NextLinkProps, 'as'>
  & ChakraLinkProps
  & {
    hrefAs?: string | UrlObject
  }
>

//  Has to be a new component because both chakra and next share the `as` keyword
const NextChakraLink = React.forwardRef<HTMLAnchorElement, NextChakraLinkProps>(function NextChakraLink({
  href,
  hrefAs,
  replace,
  scroll,
  shallow,
  prefetch,
  locale,
  children,
  ...chakraProps
}: NextChakraLinkProps, ref) {
  return (
    <NextLink
      passHref
      href={href}
      as={hrefAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
      locale={locale}
    >
      <ChakraLink ref={ref} {...chakraProps}>{children}</ChakraLink>
    </NextLink>
  );
});

export default NextChakraLink;

/*
  Usages:

  <NextChakraLink
    href="#"
    color="primary.500"
  >
    Some blog post
  </NextChakraLink>

  <Button
    as={NextChakraLink}
    href=#
    colorScheme="primary"
  >
    Some blog post
  </Button>
*/
