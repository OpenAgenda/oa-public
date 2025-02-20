import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { ActivitiesProvider } from './context';

const PAGE_SIZE = 20;

export function Activities({ res, hideEmpty = false, children }) {
  const {
    data: pages,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      const { after } = previousPageData || {};

      // reached the end
      if (after === null) {
        return null;
      }

      // first page, we don't have `previousPageData`
      if (pageIndex === 0)
        return ['EventShow', 'activities', res, pageIndex, 0];

      // add the cursor to the API endpoint
      return ['EventShow', 'activities', res, pageIndex, after];
    },
    ([_comp, _requestId, activitiesRes, pageIndex, after]) =>
      fetch(
        `${activitiesRes}?after=${after}${pageIndex === 0 ? '&withConfig=1' : ''}`,
      ).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't list activities");
      }),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = !pages?.[0]?.activities?.length;
  const isReachingEnd =
    isEmpty ||
    (pages && pages[pages.length - 1]?.activities?.length < PAGE_SIZE);

  const nextPage = useCallback(
    (e) => {
      e.preventDefault();
      setSize((s) => s + 1);
    },
    [setSize],
  );

  if (hideEmpty && (isLoadingInitialData || isEmpty || error)) {
    return null;
  }

  const context = {
    pages,
    error,
    nextPage,
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
  };

  return <ActivitiesProvider value={context}>{children}</ActivitiesProvider>;
}
