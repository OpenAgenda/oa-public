import {
  MapFilter_default
} from "./chunk-VZF2MR7D.js";
import {
  NumberRangeFilter_default
} from "./chunk-444AZKQJ.js";
import {
  SearchFilter_default
} from "./chunk-2MRLBDJH.js";
import {
  SimpleDateRangeFilter_default
} from "./chunk-RF4NYU22.js";
import {
  TimelineFilter_default
} from "./chunk-7UDPHN3H.js";
import {
  ChoiceFilter_default
} from "./chunk-SA3WJCAL.js";
import {
  CustomFilter_default
} from "./chunk-FC4CRMEK.js";
import {
  DefinedRangeFilter_default
} from "./chunk-SFQSTNHB.js";
import {
  FavoritesFilter_default
} from "./chunk-7D7BIYPT.js";
import {
  Filters_default
} from "./chunk-ZE7LKT33.js";
import {
  useActiveFilters
} from "./chunk-3ZIV3ILV.js";
import {
  DateRangeFilter_default
} from "./chunk-MC7YQHTQ.js";

// src/components/ActiveFilters.js
import { jsx } from "@emotion/react/jsx-runtime";
function ActiveFilters({ filters, ...rest }) {
  const activeFilters = useActiveFilters(filters);
  return /* @__PURE__ */ jsx(
    Filters_default,
    {
      filters: activeFilters,
      choiceComponent: ChoiceFilter_default.Preview,
      dateRangeComponent: DateRangeFilter_default.Preview,
      simpleDateRangeComponent: SimpleDateRangeFilter_default.Preview,
      numberRangeComponent: NumberRangeFilter_default.Preview,
      definedRangeComponent: DefinedRangeFilter_default.Preview,
      searchComponent: SearchFilter_default.Preview,
      mapComponent: MapFilter_default.Preview,
      customComponent: CustomFilter_default.Preview,
      favoritesComponent: FavoritesFilter_default.Preview,
      timelineComponent: TimelineFilter_default.Preview,
      ...rest
    }
  );
}

export {
  ActiveFilters
};
//# sourceMappingURL=chunk-OXSXNVHF.js.map