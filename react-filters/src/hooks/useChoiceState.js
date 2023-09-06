import { useCallback, useMemo, useState } from 'react';
import { useIsomorphicLayoutEffect, usePrevious } from 'react-use';
import Fuse from 'fuse.js';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';

export default function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
}) {
  const [countOptions, setCountOptions] = useState(pageSize);
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const [searchValue, setSearchValue] = useState('');
  const previousSearchValue = usePrevious(searchValue);
  const [foundOptions, setFoundOptions] = useState(options);

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

  const fuse = useConstant(
    () => new Fuse(options, {
      threshold: 0.3,
      ignoreLocation: true,
      distance: 100,
      keys: ['label'],
    }),
  );

  // Update fuse docs if options change
  useIsomorphicLayoutEffect(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);

      const newOptions = searchValue === ''
        ? options
        : fuse.search(searchValue).map(v => v.item);

      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options]);

  // Update search results if search change
  useIsomorphicLayoutEffect(() => {
    if (
      previousSearchValue !== undefined
      && searchValue !== previousSearchValue
    ) {
      const newOptions = searchValue === ''
        ? options
        : fuse.search(searchValue).map(v => v.item);

      // if (newOptions.length <= pageSize || searchValue === '') {
      //   lessOptions();
      // }

      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, previousSearchValue]);

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
