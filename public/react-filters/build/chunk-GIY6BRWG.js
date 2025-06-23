// src/hooks/useChoiceState.js
import { useCallback, useMemo, useState } from "react";
import useIsomorphicLayoutEffectModule from "react-use/lib/useIsomorphicLayoutEffect.js";
import usePreviousModule from "react-use/lib/usePrevious.js";
import { useIntl } from "react-intl";
import Fuse from "fuse.js";
import useConstant from "@openagenda/react-shared/dist/hooks/useConstant.js";
var useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;
var usePrevious = usePreviousModule.default || usePreviousModule;
function getCollator(locale, defaultLocale) {
  try {
    return new Intl.Collator(locale, {
      sensitivity: "base",
      usage: "sort"
    });
  } catch {
    return new Intl.Collator(defaultLocale, {
      sensitivity: "base",
      usage: "sort"
    });
  }
}
function filterOptions({ options, fuse, searchValue, sort, collator }) {
  if (searchValue === "") {
    if (sort === "alphabetical") {
      return [...options].sort((a, b) => collator.compare(a.label, b.label));
    }
    return options;
  }
  return fuse.search(searchValue).map((v) => v.item);
}
function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
  sort = null
}) {
  const intl = useIntl();
  const [countOptions, setCountOptions] = useState(pageSize);
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);
  const fuse = useConstant(
    () => new Fuse(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = useMemo(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = useState("");
  const previousSearchValue = usePrevious(searchValue);
  const [foundOptions, setFoundOptions] = useState(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = useCallback(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = useCallback(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious(collapsed);
  useIsomorphicLayoutEffect(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = useCallback((e) => setSearchValue(e.target.value), []);
  useIsomorphicLayoutEffect(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, sort, collator]);
  useIsomorphicLayoutEffect(() => {
    if (previousSearchValue !== void 0 && searchValue !== previousSearchValue) {
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
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
    lessOptions
  };
}

export {
  useChoiceState
};
//# sourceMappingURL=chunk-GIY6BRWG.js.map