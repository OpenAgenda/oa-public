var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hooks/useChoiceState.js
var useChoiceState_exports = {};
__export(useChoiceState_exports, {
  default: () => useChoiceState
});
module.exports = __toCommonJS(useChoiceState_exports);
var import_react = require("react");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react_intl = require("react-intl");
var import_fuse = __toESM(require("fuse.js"), 1);
var import_useConstant = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
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
  const intl = (0, import_react_intl.useIntl)();
  const [countOptions, setCountOptions] = (0, import_react.useState)(pageSize);
  const options = (0, import_react.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const fuse = (0, import_useConstant.default)(
    () => new import_fuse.default(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = (0, import_react.useMemo)(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = (0, import_react.useState)("");
  const previousSearchValue = usePrevious(searchValue);
  const [foundOptions, setFoundOptions] = (0, import_react.useState)(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = (0, import_react.useCallback)(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = (0, import_react.useCallback)(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious(collapsed);
  useIsomorphicLayoutEffect(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = (0, import_react.useCallback)((e) => setSearchValue(e.target.value), []);
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
//# sourceMappingURL=useChoiceState.cjs.map