var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/fields/MapField/mapStyle.js
var mapStyle_exports = {};
__export(mapStyle_exports, {
  gestureHandlingStyle: () => gestureHandlingStyle,
  markerClusterStyle: () => markerClusterStyle
});
module.exports = __toCommonJS(mapStyle_exports);
var markerClusterStyle = {
  "& .marker-cluster-small": {
    backgroundColor: "rgba(181, 226, 140, 0.6)"
  },
  "& .marker-cluster-small div": {
    backgroundColor: "rgba(110, 204, 57, 0.6)"
  },
  "& .marker-cluster-medium": {
    backgroundColor: "rgba(241, 211, 87, 0.6)"
  },
  "& .marker-cluster-medium div": {
    backgroundColor: "rgba(240, 194, 12, 0.6)"
  },
  "& .marker-cluster-large": {
    backgroundColor: "rgba(253, 156, 115, 0.6)"
  },
  "& .marker-cluster-large div": {
    backgroundColor: "rgba(241, 128, 23, 0.6)"
  },
  "& .marker-cluster": {
    backgroundClip: "padding-box",
    borderRadius: "20px"
  },
  "& .marker-cluster div": {
    width: "30px",
    height: "30px",
    marginLeft: "5px",
    marginTop: "5px",
    textAlign: "center",
    borderRadius: "15px",
    font: "12px 'Helvetica Neue', Arial, Helvetica, sans-serif"
  },
  "& .marker-cluster span": {
    lineHeight: "30px"
  }
};
var gestureHandlingStyle = {
  "&.leaflet-gesture-handling:after": {
    color: "#fff",
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: "22px",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    padding: "15px",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0, 0, 0, .5)",
    zIndex: 1001,
    pointerEvents: "none",
    textAlign: "center",
    transition: "opacity .8s ease-in-out",
    opacity: 0,
    content: '""'
  },
  "&.leaflet-gesture-handling-warning:after": {
    transitionDuration: ".3s",
    opacity: 1
  },
  "&.leaflet-gesture-handling-touch:after": {
    content: "attr(data-gesture-handling-touch-content)"
  },
  "&.leaflet-gesture-handling-scroll:after": {
    content: "attr(data-gesture-handling-scroll-content)"
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  gestureHandlingStyle,
  markerClusterStyle
});
//# sourceMappingURL=mapStyle.cjs.map