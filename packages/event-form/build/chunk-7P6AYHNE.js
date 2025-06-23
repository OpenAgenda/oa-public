import {
  convertTimezoneOffset,
  fZ
} from "./chunk-UJTMWBIB.js";

// src/components/Timings.js
import _ from "lodash";
import { Component } from "react";
import TimingsPicker, { classNames } from "@openagenda/react-timingspicker";
import { jsx } from "react/jsx-runtime";
function safariTimezone({ date, hours, minutes }) {
  return convertTimezoneOffset(
    (/* @__PURE__ */ new Date(`${date}T${hours}:${minutes}`)).getTimezoneOffset() / 60
  );
}
function loadTimings(props) {
  return (props.value || _.get(props, "field.default") || []).map((t) => ({
    begin: /* @__PURE__ */ new Date(
      `${t.begin.date}T${t.begin.hours}:${t.begin.minutes}${safariTimezone(t.begin)}`
    ),
    end: /* @__PURE__ */ new Date(
      `${t.end.date}T${t.end.hours}:${t.end.minutes}${safariTimezone(t.end)}`
    )
  }));
}
function extractDateString(d) {
  return [d.getFullYear(), fZ(d.getMonth() + 1), fZ(d.getDate())].join("-");
}
var TimingsComponent = class extends Component {
  static defaultProps = {
    value: null,
    field: {}
  };
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }
  static getDerivedStateFromProps(props) {
    const partialState = {
      lang: props.lang
    };
    partialState.value = loadTimings(props);
    partialState.allowedTimings = _.get(props, "field.enabledRanges") ? props.field.enabledRanges.map((v) => ({
      begin: v.begin,
      end: v.end.includes("T") ? v.end : `${v.end}T23:59:59.999`
    })) : null;
    return partialState;
  }
  onTimingsChange = (timings = [], beginKey = "begin") => {
    this.props.onChange(
      timings.map((t) => ({
        begin: {
          date: extractDateString(t[beginKey]),
          hours: fZ(t[beginKey].getHours()),
          minutes: fZ(t[beginKey].getMinutes())
        },
        end: {
          date: extractDateString(t.end),
          hours: fZ(t.end.getHours()),
          minutes: fZ(t.end.getMinutes())
        }
      }))
    );
  };
  render() {
    const { value, lang, allowedTimings } = this.state;
    return /* @__PURE__ */ jsx(
      TimingsPicker,
      {
        onChange: this.onTimingsChange,
        value,
        locale: lang,
        weekStartsOn: 1,
        allowedTimings,
        classNames: classNames.bootstrap3
      }
    );
  }
};

export {
  TimingsComponent
};
//# sourceMappingURL=chunk-7P6AYHNE.js.map