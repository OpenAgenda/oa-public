import { UrlObject } from 'node:url';
import { PropsWithChildren } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import {
  LinkOverlay as ChakraLinkOverlay,
  LinkOverlayProps as ChakraLinkOverlayProps,
} from '@openagenda/uikit';

export type NextChakraLinkOverlayProps = PropsWithChildren<
  Omit<NextLinkProps, 'as'>
  & ChakraLinkOverlayProps
  & {
    hrefAs?: string | UrlObject
  }
>

//  Has to be a new component because both chakra and next share the `as` keyword
export default function NextChakraLinkOverlay({
  href,
  hrefAs,
  replace,
  scroll,
  shallow,
  prefetch,
  locale,
  children,
  ...chakraProps
}: NextChakraLinkOverlayProps) {
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
      <ChakraLinkOverlay {...chakraProps}>{children}</ChakraLinkOverlay>
    </NextLink>
  );
}

/*
  Usage:

  <LinkBox as='article'>
    <h2>
      <NextChakraLinkOverlay href='#'>
        <LinkOverlay>Some blog post</LinkOverlay>
      </NextChakraLinkOverlay>
    </h2>
    <p>
      As a side note, using quotation marks around an attribute value is
      required only if this value is not a valid identifier.
    </p>
    <a href='#'>Some inner link</a>
  </LinkBox>
*/
