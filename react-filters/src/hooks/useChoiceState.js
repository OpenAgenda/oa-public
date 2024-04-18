import { useCallback, useMemo, useState } from 'react';
import { useIsomorphicLayoutEffect, usePrevious } from 'react-use';
import { useIntl } from 'react-intl';
import Fuse from 'fuse.js';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';

function getCollator(locale, defaultLocale) {
  try {
    return new Intl.Collator(locale, {
      sensitivity: 'base',
      usage: 'sort',
    });
  } catch {
    return new Intl.Collator(defaultLocale, {
      sensitivity: 'base',
      usage: 'sort',
    });
  }
}

function filterOptions({ options, fuse, searchValue, sort, collator }) {
  if (searchValue === '') {
    if (sort === 'alphabetical') {
      return [...options].sort((a, b) => collator.compare(a.label, b.label));
    }

    return options;
  }

  return fuse.search(searchValue).map(v => v.item);
}

export default function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
  sort = null,
}) {
  const intl = useIntl();
  const [countOptions, setCountOptions] = useState(pageSize);
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const fuse = useConstant(
    () =>
      new Fuse(options, {
        threshold: 0.3,
        ignoreLocation: true,
        keys: ['label'],
      }),
  );

  const collator = useMemo(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale],
  );

  const [searchValue, setSearchValue] = useState('');
  const previousSearchValue = usePrevious(searchValue);
  const [foundOptions, setFoundOptions] = useState(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator,
    }),
  );

  const moreOptions = useCallback(
    () => setCountOptions(v => v + pageSize),
    [pageSize],
  );
  const lessOptions = useCallback(() => setCountOptions(pageSize), [pageSize]);

  const previousCollpased = usePrevious(collapsed);

  useIsomorphicLayoutEffect(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);

  const hasMoreOptions = countOptions < foundOptions.length;

  const onSearchChange = useCallback(e => setSearchValue(e.target.value), []);

  // Update fuse docs if options change
  useIsomorphicLayoutEffect(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);

      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator,
      });

      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, sort, collator]);

  // Update search results if search change
  useIsomorphicLayoutEffect(() => {
    if (
      previousSearchValue !== undefined
      && searchValue !== previousSearchValue
    ) {
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator,
      });

      // if (newOptions.length <= pageSize || searchValue === '') {
      //   lessOptions();
      // }

      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, previousSearchValue, sort, collator]);

  return {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions,
  };
}
