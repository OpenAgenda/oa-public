// src/components/fields/MapField/LoadableMap.js
import loadable from "@openagenda/react-shared/dist/utils/loadable.js";
var LoadableMapField = loadable(
  () => import(
    /* webpackChunkName: "reactFilters-Map" */
    "./components/fields/MapField/Map.js"
  ),
  { ssr: false }
);
var LoadableMap_default = LoadableMapField;

export {
  LoadableMap_default
};
//# sourceMappingURL=chunk-PKBKHW4K.js.map