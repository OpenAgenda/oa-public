// src/validators/location.js
import _ from "lodash";
import schema from "@openagenda/validators/schema/index.js";
import textValidator from "@openagenda/validators/text.js";
import integerValidator from "@openagenda/validators/integer.js";
import latitudeValidator from "@openagenda/validators/latitude.js";
import longitudeValidator from "@openagenda/validators/longitude.js";
schema.register({
  text: textValidator,
  integer: integerValidator,
  latitude: latitudeValidator,
  longitude: longitudeValidator
});
var locationSchema = {
  uid: {
    type: "integer",
    optional: false
  },
  name: {
    type: "text"
  },
  address: {
    type: "text"
  },
  latitude: {
    type: "latitude"
  },
  longitude: {
    type: "longitude"
  },
  timezone: {
    type: "text"
  }
};
var validate = schema(locationSchema);
var validateDraft = schema({
  ...locationSchema,
  uid: {
    type: "integer"
  }
});
var location_default = (options) => (value) => {
  const optional = _.get(options, "optional", true);
  if (optional && value === void 0) {
    return _.get(options, "default");
  }
  if (optional && value === null) {
    return null;
  }
  try {
    return (optional ? validateDraft : validate)(value);
  } catch (errors) {
    throw errors.map((e) => ({
      ...e,
      field: "location",
      code: `location.${e.code}`
    }));
  }
};

export {
  location_default
};
//# sourceMappingURL=chunk-4LU3LPNS.js.map