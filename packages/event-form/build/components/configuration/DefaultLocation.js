import "../../chunk-PZ5AY32C.js";

// src/components/configuration/DefaultLocation.js
import Select from "react-select";
import { useState, useEffect } from "react";
import axios from "axios";
import countries from "@openagenda/countries/labels.js";
import defaultLocationLabels from "@openagenda/labels/event/defaultLocation.js";
import flattenLabels from "@openagenda/labels/flatten.js";
import LocationSelector from "@openagenda/agenda-locations-app/dist/components/LocationSelector.js";
import Provider from "@openagenda/agenda-locations-app/dist/decorators/Providers.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var DefaultLocation = ({
  lang = "fr",
  value = null,
  field,
  onChange,
  enabled = true
}) => {
  const labels = flattenLabels(defaultLocationLabels, lang);
  const extractCountryNames = () => countries.map((c) => ({
    value: c.code,
    label: c[lang]
  }));
  const options = extractCountryNames();
  const selectValue = options.find(
    (option) => option.value === (value == null ? void 0 : value.countryCode)
  );
  const [mode, setMode] = useState((value == null ? void 0 : value.uid) ? "show" : "search");
  const [loc, setLoc] = useState(null);
  useEffect(() => {
    if (value == null ? void 0 : value.uid) {
      axios.get(field.res.getLocationDetails.replace(":locationUid", value.uid)).then((r) => setLoc(r.data));
    }
  }, []);
  const locationSelectorOnChange = (m, l) => {
    setMode(m);
    setLoc(l);
    if (l.uid) onChange({ ...value, uid: l.uid });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "margin-bottom-md", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "DefaultLocation", children: labels.chooseDefaultLocation }),
      /* @__PURE__ */ jsx(Provider, { lang, children: /* @__PURE__ */ jsx(
        LocationSelector,
        {
          enableDetails: false,
          allowCreate: false,
          confirmRequired: false,
          tiles: null,
          mode,
          disableChange: false,
          detailedInfo: null,
          classNames: {
            input: ""
          },
          allowRemove: true,
          onRemove: () => {
            setLoc(null);
            setMode("search");
            onChange((({ uid, ...o }) => o)(value));
          },
          location: loc,
          lang,
          settings: null,
          res: {
            get: field.res.getLocationDetails,
            index: field.res.listLocations,
            staticTiles: field.res.staticTiles
          },
          onChange: (m, l) => locationSelectorOnChange(m, l)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: enabled ? "form-group country" : "form-group country disabled",
        children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "Country", children: labels.chooseDefaultCountry }),
          /* @__PURE__ */ jsx(
            Select,
            {
              disabled: !enabled,
              options,
              value: selectValue,
              onChange: (val) => {
                onChange({ ...value, countryCode: val.value });
              },
              clearable: false
            }
          )
        ]
      }
    )
  ] });
};
var DefaultLocation_default = DefaultLocation;
export {
  DefaultLocation_default as default
};
//# sourceMappingURL=DefaultLocation.js.map