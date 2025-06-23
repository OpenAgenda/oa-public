// src/components/Filters.js
import React from "react";
import { useUIDSeed } from "react-uid";
import { Portal } from "@openagenda/react-portal-ssr";
import { Fragment, jsx } from "@emotion/react/jsx-runtime";
function Noop() {
  return null;
}
function Filters({
  filters,
  withRef = false,
  choiceComponent: ChoiceComponent = Noop,
  dateRangeComponent: DateRangeComponent = Noop,
  simpleDateRangeComponent: SimpleDateRangeComponent = Noop,
  definedRangeComponent: DefinedRangeComponent = Noop,
  numberRangeComponent: NumberRangeComponent = Noop,
  mapComponent: MapComponent = Noop,
  searchComponent: SearchComponent = Noop,
  customComponent: CustomComponent = Noop,
  favoritesComponent: FavoritesComponent = Noop,
  timelineComponent: TimelineComponent = Noop,
  choiceProps = null,
  dateRangeProps = null,
  numberRangeProps = null,
  definedRangeProps = null,
  mapProps = null,
  searchProps = null,
  customProps = null,
  favoritesProps = null,
  timelineProps = null,
  ...additionnalProps
}) {
  const seed = useUIDSeed();
  return /* @__PURE__ */ jsx(Fragment, { children: filters.map((filter) => {
    let elem;
    switch (filter.type) {
      case "dateRange":
        elem = /* @__PURE__ */ jsx(
          DateRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...dateRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "simpleDateRange":
        elem = /* @__PURE__ */ jsx(
          SimpleDateRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...dateRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "definedRange":
        elem = /* @__PURE__ */ jsx(
          DefinedRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...definedRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "numberRange": {
        elem = /* @__PURE__ */ jsx(
          NumberRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...numberRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      }
      case "choice":
        elem = /* @__PURE__ */ jsx(
          ChoiceComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...choiceProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "map":
        elem = /* @__PURE__ */ jsx(
          MapComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...mapProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "search":
        elem = /* @__PURE__ */ jsx(
          SearchComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...searchProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "custom":
        elem = /* @__PURE__ */ jsx(
          CustomComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...customProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "favorites":
        elem = /* @__PURE__ */ jsx(
          FavoritesComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...favoritesProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "timeline":
        elem = /* @__PURE__ */ jsx(
          TimelineComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...timelineProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      default:
        elem = null;
        break;
    }
    if (filter.destSelector) {
      return /* @__PURE__ */ jsx(Portal, { selector: filter.destSelector, children: elem }, seed(filter));
    }
    return elem;
  }) });
}
var Filters_default = React.memo(Filters);

export {
  Filters_default
};
//# sourceMappingURL=chunk-ZE7LKT33.js.map