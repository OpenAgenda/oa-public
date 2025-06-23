import {
  flattenLocationTagSet_default
} from "./chunk-VB3R3CZR.js";

// src/components/Location.js
import _ from "lodash";
import ih from "immutability-helper";
import sa from "superagent";
import { Component } from "react";
import { Modal, Spinner } from "@openagenda/react-shared";
import LocationSelector from "@openagenda/agenda-locations-app/dist/components/LocationSelector.js";
import Provider from "@openagenda/agenda-locations-app/dist/decorators/Providers.js";
import { jsx, jsxs } from "react/jsx-runtime";
var getResItem = (res, key, suffix) => {
  if (typeof res === "string") {
    return res + suffix;
  }
  if (res[key]) {
    return res[key];
  }
  return res.default + suffix;
};
var getResObject = (res) => ({
  ...res,
  index: getResItem(res, "index", ""),
  get: getResItem(res, "get", "/:locationUid"),
  geocode: getResItem(res, "geocode", "/geocode"),
  reverseGeocode: getResItem(res, "reverse", "/geocode/reverse"),
  insee: getResItem(res, "insee", "/insee"),
  create: getResItem(res, "create", ""),
  remove: getResItem(res, "remove", "/remove")
});
var LocationComponent = class extends Component {
  static defaultProps = {
    location: null,
    lang: "en",
    legacy: {},
    field: null
  };
  constructor(props) {
    super(props);
    const locationUid = _.get(props, "value.uid") || _.get(props, "field.default.uid");
    const res = getResObject(props.field.res);
    if (!locationUid) {
      this.state = {
        mode: "search",
        res
      };
    } else {
      this.state = {
        initing: true,
        res
      };
      this.loadLocation(locationUid);
    }
    this.onChange = this.onChange.bind(this);
  }
  onChange(mode, location) {
    const { onChange } = this.props;
    this.setState({ mode });
    onChange(location);
  }
  getSettings() {
    const { lang, field } = this.props;
    const settings = {
      ...(field == null ? void 0 : field.legacy) ?? {},
      ...(field == null ? void 0 : field.settings) ?? {}
    };
    if (settings.tagSet) {
      return ih(settings, {
        tagSet: { $set: flattenLocationTagSet_default(settings.tagSet, lang) }
      });
    }
    return settings;
  }
  loadLocation(locationUid) {
    const { res } = this.state;
    const { onChange } = this.props;
    sa.get(res.get.replace(":locationUid", locationUid)).then(
      (response) => {
        this.setState({
          initing: false,
          mode: response.body ? "show" : "search"
        });
        onChange(response.body);
      },
      (err) => {
        console.log("could not load %s", locationUid);
        console.log(err);
        this.setState({
          initing: false,
          mode: "search"
        });
      }
    );
  }
  renderSelector() {
    const { lang, value, relatedValues, field } = this.props;
    const { mode, res } = this.state;
    const allowRemove = (relatedValues == null ? void 0 : relatedValues.attendanceMode) === 2;
    const {
      default: defaultValue,
      tiles,
      detailedInfo,
      disableChange,
      allowCreate,
      confirmRequired
    } = field;
    return /* @__PURE__ */ jsx(Provider, { lang, children: /* @__PURE__ */ jsx(
      LocationSelector,
      {
        allowCreate,
        confirmRequired,
        tiles,
        mode,
        disableChange,
        detailedInfo,
        classNames: {
          input: ""
        },
        allowRemove,
        onRemove: () => this.onChange("search", null),
        location: _.assign({}, defaultValue || {}, value),
        lang,
        settings: this.getSettings(),
        res,
        onChange: this.onChange,
        placeholder: field.placeholder
      }
    ) });
  }
  render() {
    const { field } = this.props;
    const { initing, mode } = this.state;
    const spinnerCanvasStyle = {
      height: 37,
      position: "relative"
    };
    if (initing) {
      return /* @__PURE__ */ jsx("div", { className: "margin-v-sm text-center", style: spinnerCanvasStyle, children: /* @__PURE__ */ jsx(Spinner, { mode: "inline" }) });
    }
    if (["create", "confirm"].includes(mode)) {
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-center", style: spinnerCanvasStyle, children: /* @__PURE__ */ jsx(Spinner, { mode: "inline" }) }),
        /* @__PURE__ */ jsx(Modal, { classNames: { overlay: "popup-overlay big" }, children: this.renderSelector() })
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: mode === "show" ? "padding-v-sm padding-h-xs" : "", children: this.renderSelector() }),
      !field.disableChange && field.sub ? /* @__PURE__ */ jsx("div", { className: "sub", children: field.sub }) : null
    ] });
  }
};
var Location_default = LocationComponent;

export {
  Location_default
};
//# sourceMappingURL=chunk-XAZJRTVC.js.map