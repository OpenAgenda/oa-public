// src/utils/minimizeAggregation.js
var shortKeys = [
  {
    short: "m",
    key: "missing"
  },
  {
    short: "s",
    key: "size"
  },
  {
    short: "t",
    key: "type"
  },
  {
    short: "k",
    key: "key"
  },
  {
    short: "f",
    key: "field"
  }
];
var shortValues = [
  {
    key: "type",
    short: "af",
    value: "additionalFields"
  }
];
function minimizeAggregation(aggregation) {
  if (typeof aggregation === "string") {
    return aggregation;
  }
  return Object.keys(aggregation).reduce(
    (carry, key) => {
      var _a, _b;
      return {
        ...carry,
        [((_a = shortKeys.find((shortKey) => shortKey.key === key)) == null ? void 0 : _a.short) ?? key]: ((_b = shortValues.find(
          (shortValue) => shortValue.key === key && aggregation[key] === shortValue.value
        )) == null ? void 0 : _b.short) ?? aggregation[key]
      };
    },
    {}
  );
}

export {
  minimizeAggregation
};
//# sourceMappingURL=chunk-32BG4YMI.js.map