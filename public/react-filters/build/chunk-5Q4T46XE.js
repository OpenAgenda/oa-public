import {
  gestureHandlingStyle,
  markerClusterStyle
} from "./chunk-RZOH5QCV.js";
import {
  LoadableMap_default
} from "./chunk-PKBKHW4K.js";

// src/components/fields/MapField/index.js
import React from "react";
import { css } from "@emotion/react";
import cn from "classnames";
import { jsx } from "@emotion/react/jsx-runtime";
var mapContainerStyle = css`
  position: relative;
`;
var mapStyle = css`
  height: 100%;
  ${markerClusterStyle}
  ${gestureHandlingStyle}
`;
function MapField({
  input,
  collapsed,
  // name,
  filter,
  tileAttribution,
  tileUrl,
  loadGeoData,
  initialViewport,
  defaultViewport,
  className,
  mapClass
}, ref) {
  return !collapsed ? /* @__PURE__ */ jsx("div", { css: mapContainerStyle, className: cn(className, mapClass), children: /* @__PURE__ */ jsx(
    LoadableMap_default,
    {
      ref,
      input,
      filter,
      tileAttribution,
      tileUrl,
      loadGeoData,
      initialViewport,
      defaultViewport,
      css: mapStyle
    }
  ) }) : null;
}
var MapField_default = React.forwardRef(MapField);

export {
  MapField_default
};
//# sourceMappingURL=chunk-5Q4T46XE.js.map