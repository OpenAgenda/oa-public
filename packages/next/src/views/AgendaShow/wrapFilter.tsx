import React, { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import { chakra, HTMLChakraProps } from '@openagenda/uikit';

type ForwardRefComponent<T, P = {}> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

type FilterType = ForwardRefComponent<HTMLElement, HTMLChakraProps<'div'> & {
  forwardedFilter: object;
}>;

export default function wrapFilter(Filter) {
  // forwardedFilter prop -> filter prop
  const WrappedFilter = React.forwardRef(function WrappedFilter({ forwardedFilter, ...props }, ref) {
    return <Filter ref={ref} filter={forwardedFilter} {...props} />;
  }) as FilterType;
  return chakra(WrappedFilter);
}
