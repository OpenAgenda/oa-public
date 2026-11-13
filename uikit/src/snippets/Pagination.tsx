'use client';

import type { ButtonProps, TextProps } from '@chakra-ui/react';
import {
  Button,
  Pagination as ChakraPagination,
  IconButton,
  Text,
  createContext,
  usePaginationContext,
} from '@chakra-ui/react';
import * as React from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiMiniEllipsisHorizontal,
} from 'react-icons/hi2';
import { LinkButton } from './LinkButton';

interface ButtonVariantMap {
  current: ButtonProps['variant'];
  default: ButtonProps['variant'];
  ellipsis: ButtonProps['variant'];
}

type PaginationVariant = 'outline' | 'solid' | 'subtle';

interface ButtonVariantContext {
  size: ButtonProps['size'];
  variantMap: ButtonVariantMap;
  getHref?: (page: number) => string;
}

const [RootPropsProvider, useRootProps] = createContext<ButtonVariantContext>({
  name: 'RootPropsProvider',
});

export interface PaginationRootProps
  extends Omit<ChakraPagination.RootProps, 'type'> {
  size?: ButtonProps['size'];
  variant?: PaginationVariant;
  getHref?: (page: number) => string;
}

const rootVariantMap: Record<PaginationVariant, ButtonVariantMap> = {
  outline: { default: 'ghost', ellipsis: 'plain', current: 'outline' },
  solid: { default: 'outline', ellipsis: 'outline', current: 'solid' },
  subtle: { default: 'ghost', ellipsis: 'plain', current: 'subtle' },
};

export const PaginationRoot = React.forwardRef<
  HTMLDivElement,
  PaginationRootProps
>(function PaginationRoot(props, ref) {
  const { size = 'sm', variant = 'outline', getHref, ...rest } = props;
  return (
    <RootPropsProvider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{ size, variantMap: rootVariantMap[variant], getHref }}
    >
      <ChakraPagination.Root
        ref={ref}
        type={getHref ? 'link' : 'button'}
        {...rest}
      />
    </RootPropsProvider>
  );
});

export const PaginationEllipsis = React.forwardRef<
  HTMLDivElement,
  ChakraPagination.EllipsisProps
>(function PaginationEllipsis(props, ref) {
  const { size, variantMap } = useRootProps();
  return (
    <ChakraPagination.Ellipsis ref={ref} {...props} asChild>
      <Button as="span" variant={variantMap.ellipsis} size={size}>
        <HiMiniEllipsisHorizontal />
      </Button>
    </ChakraPagination.Ellipsis>
  );
});

export const PaginationItem = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.ItemProps
>(function PaginationItem(props, ref) {
  const { page } = usePaginationContext();
  const { size, variantMap, getHref } = useRootProps();

  const current = page === props.value;
  const variant = current ? variantMap.current : variantMap.default;

  if (getHref) {
    return (
      <LinkButton
        href={getHref(props.value)}
        variant={variant}
        size={size}
        aria-current={current ? 'page' : undefined}
      >
        {props.value}
      </LinkButton>
    );
  }

  return (
    <ChakraPagination.Item ref={ref} {...props} asChild>
      <Button variant={variant} size={size}>
        {props.value}
      </Button>
    </ChakraPagination.Item>
  );
});

export const PaginationPrevTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.PrevTriggerProps
>(function PaginationPrevTrigger(props, ref) {
  const { size, variantMap, getHref } = useRootProps();
  const { previousPage } = usePaginationContext();

  // As links: named (an icon alone has no name), and a disabled button on
  // the first page rather than an `a` without an address
  if (getHref) {
    const label = props['aria-label'] ?? 'Previous page';
    return previousPage != null ? (
      <LinkButton
        href={getHref(previousPage)}
        variant={variantMap.default}
        size={size}
        aria-label={label}
      >
        <HiChevronLeft />
      </LinkButton>
    ) : (
      <IconButton
        variant={variantMap.default}
        size={size}
        aria-label={label}
        disabled
      >
        <HiChevronLeft />
      </IconButton>
    );
  }

  return (
    <ChakraPagination.PrevTrigger ref={ref} asChild {...props}>
      <IconButton variant={variantMap.default} size={size}>
        <HiChevronLeft />
      </IconButton>
    </ChakraPagination.PrevTrigger>
  );
});

export const PaginationNextTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.NextTriggerProps
>(function PaginationNextTrigger(props, ref) {
  const { size, variantMap, getHref } = useRootProps();
  const { nextPage } = usePaginationContext();

  if (getHref) {
    const label = props['aria-label'] ?? 'Next page';
    return nextPage != null ? (
      <LinkButton
        href={getHref(nextPage)}
        variant={variantMap.default}
        size={size}
        aria-label={label}
      >
        <HiChevronRight />
      </LinkButton>
    ) : (
      <IconButton
        variant={variantMap.default}
        size={size}
        aria-label={label}
        disabled
      >
        <HiChevronRight />
      </IconButton>
    );
  }

  return (
    <ChakraPagination.NextTrigger ref={ref} asChild {...props}>
      <IconButton variant={variantMap.default} size={size}>
        <HiChevronRight />
      </IconButton>
    </ChakraPagination.NextTrigger>
  );
});

export const PaginationItems = (props: React.HTMLAttributes<HTMLElement>) => (
  <ChakraPagination.Context>
    {({ pages }) =>
      pages.map((page, index) =>
        (page.type === 'ellipsis' ? (
          // eslint-disable-next-line react/no-array-index-key
          <PaginationEllipsis key={index} index={index} {...props} />
        ) : (
          <PaginationItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            type="page"
            value={page.value}
            {...props}
          />
        )))}
  </ChakraPagination.Context>
);

interface PageTextProps extends TextProps {
  format?: 'short' | 'compact' | 'long';
}

export const PaginationPageText = React.forwardRef<
  HTMLParagraphElement,
  PageTextProps
>(function PaginationPageText(props, ref) {
  const { format = 'compact', ...rest } = props;
  const { page, totalPages, pageRange, count } = usePaginationContext();
  const content = React.useMemo(() => {
    if (format === 'short') return `${page} / ${totalPages}`;
    if (format === 'compact') return `${page} of ${totalPages}`;
    return `${pageRange.start + 1} - ${Math.min(pageRange.end, count)} of ${count}`;
  }, [format, page, totalPages, pageRange, count]);

  return (
    <Text fontWeight="medium" ref={ref} {...rest}>
      {content}
    </Text>
  );
});
