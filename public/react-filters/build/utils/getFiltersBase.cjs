var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/getFiltersBase.js
var getFiltersBase_exports = {};
__export(getFiltersBase_exports, {
  default: () => getFiltersBase
});
module.exports = __toCommonJS(getFiltersBase_exports);

// src/utils/withDefaultFilterConfig.js
var import_defaults = __toESM(require("lodash/defaults.js"), 1);
var import_intl = require("@openagenda/intl");

// src/messages/relative.js
var import_react_intl = require("react-intl");
var relative_default = (0, import_react_intl.defineMessages)({
  passed: {
    id: "ReactFilters.messages.relative.passed",
    defaultMessage: "Passed"
  },
  current: {
    id: "ReactFilters.messages.relative.current",
    defaultMessage: "Current"
  },
  upcoming: {
    id: "ReactFilters.messages.relative.upcoming",
    defaultMessage: "Upcoming"
  }
});

// src/messages/attendanceMode.js
var import_react_intl2 = require("react-intl");
var attendanceMode_default = (0, import_react_intl2.defineMessages)({
  offline: {
    id: "ReactFilters.messages.attendanceMode.offline",
    defaultMessage: "In situ"
  },
  online: {
    id: "ReactFilters.messages.attendanceMode.online",
    defaultMessage: "Online"
  },
  mixed: {
    id: "ReactFilters.messages.attendanceMode.mixed",
    defaultMessage: "Mixed"
  }
});

// src/messages/provenance.js
var import_react_intl3 = require("react-intl");
var provenance_default = (0, import_react_intl3.defineMessages)({
  contribution: {
    id: "ReactFilters.messages.provenance.contribution",
    defaultMessage: "Contribution"
  },
  aggregation: {
    id: "ReactFilters.messages.provenance.aggregation",
    defaultMessage: "Aggregation"
  },
  share: {
    id: "ReactFilters.messages.provenance.share",
    defaultMessage: "Share"
  }
});

// src/messages/featured.js
var import_react_intl4 = require("react-intl");
var featured_default = (0, import_react_intl4.defineMessages)({
  featured: {
    id: "ReactFilters.messages.featured.featured",
    defaultMessage: "Featured"
  }
});

// src/messages/state.js
var import_react_intl5 = require("react-intl");
var state_default = (0, import_react_intl5.defineMessages)({
  refused: {
    id: "ReactFilters.messages.state.refused",
    defaultMessage: "Refused"
  },
  toModerate: {
    id: "ReactFilters.messages.state.toModerate",
    defaultMessage: "To moderate"
  },
  controlled: {
    id: "ReactFilters.messages.state.controlled",
    defaultMessage: "Controlled"
  },
  published: {
    id: "ReactFilters.messages.state.published",
    defaultMessage: "Published"
  }
});

// src/messages/status.js
var import_react_intl6 = require("react-intl");
var status_default = (0, import_react_intl6.defineMessages)({
  programmed: {
    id: "ReactFilters.messages.status.programmed",
    // 1
    defaultMessage: "Programmed"
  },
  rescheduled: {
    id: "ReactFilters.messages.status.rescheduled",
    // 2
    defaultMessage: "Rescheduled"
  },
  movedOnline: {
    id: "ReactFilters.messages.status.movedOnline",
    // 3
    defaultMessage: "Moved online"
  },
  postponed: {
    id: "ReactFilters.messages.status.postponed",
    // 4
    defaultMessage: "Postponed"
  },
  full: {
    id: "ReactFilters.messages.status.full",
    // 5
    defaultMessage: "Fully booked"
  },
  cancelled: {
    id: "ReactFilters.messages.status.cancelled",
    // 6
    defaultMessage: "Cancelled"
  }
});

// src/messages/boolean.js
var import_react_intl7 = require("react-intl");
var boolean_default = (0, import_react_intl7.defineMessages)({
  selected: {
    id: "ReactFilters.messages.boolean.selected",
    defaultMessage: "Selected"
  },
  notSelected: {
    id: "ReactFilters.messages.boolean.notSelected",
    defaultMessage: "Not selected"
  }
});

// src/messages/accessibilities.js
var import_react_intl8 = require("react-intl");
var accessibilities_default = (0, import_react_intl8.defineMessages)({
  hi: {
    id: "ReactFilters.messages.accessiblities.hi",
    defaultMessage: "Hearing impairment"
  },
  vi: {
    id: "ReactFilters.messages.accessiblities.vi",
    defaultMessage: "Visual impairment"
  },
  pi: {
    id: "ReactFilters.messages.accessiblities.pi",
    defaultMessage: "Psychic impairment"
  },
  mi: {
    id: "ReactFilters.messages.accessiblities.mi",
    defaultMessage: "Motor impairment"
  },
  ii: {
    id: "ReactFilters.messages.accessiblities.ii",
    defaultMessage: "Intellectual impairment"
  }
});

// src/utils/dateRanges.js
var import_date_fns = require("date-fns");
var import_react_intl9 = require("react-intl");
var messages = (0, import_react_intl9.defineMessages)({
  today: {
    id: "ReactFilters.dateRanges.today",
    defaultMessage: "Today"
  },
  tomorrow: {
    id: "ReactFilters.dateRanges.tomorrow",
    defaultMessage: "Tomorrow"
  },
  thisWeekend: {
    id: "ReactFilters.dateRanges.thisWeekend",
    defaultMessage: "This week-end"
  },
  currentWeek: {
    id: "ReactFilters.dateRanges.currentWeek",
    defaultMessage: "Current week"
  },
  currentMonth: {
    id: "ReactFilters.dateRanges.currentMonth",
    defaultMessage: "Current month"
  }
});
function getClosestDayAfter(dayOfWeek, fromDate = /* @__PURE__ */ new Date()) {
  const dayOfWeekMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thur: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };
  const offsetDays = dayOfWeekMap[dayOfWeek] - (0, import_date_fns.getISODay)(fromDate);
  return (0, import_date_fns.addDays)(fromDate, offsetDays);
}
function isSelected(range, _timeZone) {
  const definedRange = this.range();
  return range && ((0, import_date_fns.isSameDay)(range.startDate, definedRange.startDate) || range.startDate === definedRange.startDate) && ((0, import_date_fns.isSameDay)(range.endDate, definedRange.endDate) || range.endDate === definedRange.endDate);
}
function createStaticRanges(ranges) {
  return ranges.map((range) => ({ isSelected, ...range }));
}
function dateRanges(intl, opts = {}) {
  const { dateFnsLocale } = opts;
  const nextSaturday = getClosestDayAfter("Sat");
  const startOfWeekend = (0, import_date_fns.startOfDay)(nextSaturday);
  const endOfWeekend = (0, import_date_fns.endOfDay)((0, import_date_fns.addDays)(nextSaturday, 1));
  const now = /* @__PURE__ */ new Date();
  const defineds = {
    startOfToday: (0, import_date_fns.startOfDay)(now, { locale: dateFnsLocale }),
    endOfToday: (0, import_date_fns.endOfDay)(now, { locale: dateFnsLocale }),
    startOfTomorrow: (0, import_date_fns.startOfDay)((0, import_date_fns.addDays)(now, 1), { locale: dateFnsLocale }),
    endOfTomorrow: (0, import_date_fns.endOfDay)((0, import_date_fns.addDays)(now, 1), { locale: dateFnsLocale }),
    startOfWeek: (0, import_date_fns.startOfWeek)(now, { locale: dateFnsLocale }),
    endOfWeek: (0, import_date_fns.endOfWeek)(now, { locale: dateFnsLocale }),
    startOfMonth: (0, import_date_fns.startOfMonth)(now, { locale: dateFnsLocale }),
    endOfMonth: (0, import_date_fns.endOfMonth)(now, { locale: dateFnsLocale }),
    startOfWeekend,
    endOfWeekend
  };
  const defaults2 = {
    staticRanges: createStaticRanges([
      {
        id: "today",
        label: intl.formatMessage(messages.today),
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday
        })
      },
      {
        id: "tomorrow",
        label: intl.formatMessage(messages.tomorrow),
        range: () => ({
          startDate: defineds.startOfTomorrow,
          endDate: defineds.endOfTomorrow
        })
      },
      {
        id: "thisWeekend",
        label: intl.formatMessage(messages.thisWeekend),
        range: () => ({
          startDate: defineds.startOfWeekend,
          endDate: defineds.endOfWeekend
        })
      },
      {
        id: "currentWeek",
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek
        })
      },
      {
        id: "currentMonth",
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth
        })
      }
    ]),
    inputRanges: []
  };
  return {
    staticRanges: opts.staticRanges ? opts.staticRanges.reduce((accu, next) => {
      if (typeof next === "string") {
        const result = defaults2.staticRanges.find((w) => w.id === next);
        if (result) accu.push(result);
        else console.log(`Cannot found static range "${next}"`);
      } else {
        accu.push(next);
      }
      return accu;
    }, []) : defaults2.staticRanges,
    inputRanges: opts.inputRanges || defaults2.inputRanges
  };
}

// src/utils/withDefaultFilterConfig.js
function assignDateRanges(filter, intl, dataFnsLocale) {
  if (filter.type === "definedRange") {
    Object.assign(
      filter,
      dateRanges(intl, {
        dataFnsLocale,
        staticRanges: filter.staticRanges,
        inputRanges: filter.inputRanges
      })
    );
  }
}
function withDefaultFilterConfig(filter, intl, opts = {}) {
  const { missingValue, dataFnsLocale } = opts;
  switch (filter.name) {
    case "viewport":
      (0, import_defaults.default)(filter, {
        type: "none"
      });
      break;
    case "geo":
      (0, import_defaults.default)(filter, {
        type: "map",
        aggregation: null,
        // props for MapFilter
        tileAttribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: opts.mapTiles ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      });
      break;
    case "addMethod":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(provenance_default.contribution),
            value: "contribution"
          },
          {
            label: intl.formatMessage(provenance_default.aggregation),
            value: "aggregation"
          },
          {
            label: intl.formatMessage(provenance_default.share),
            value: "share"
          }
        ],
        aggregation: {
          type: "addMethods"
        }
      });
      break;
    case "accessibility":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(accessibilities_default.hi),
            value: "hi"
          },
          {
            label: intl.formatMessage(accessibilities_default.vi),
            value: "vi"
          },
          {
            label: intl.formatMessage(accessibilities_default.pi),
            value: "pi"
          },
          {
            label: intl.formatMessage(accessibilities_default.mi),
            value: "mi"
          },
          {
            label: intl.formatMessage(accessibilities_default.ii),
            value: "ii"
          }
        ],
        aggregation: {
          type: "accessibilities"
        }
      });
      break;
    case "languages":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null
      });
      break;
    case "memberUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "member.name",
        aggregation: {
          type: "members"
        }
      });
      break;
    case "timings":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "createdAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "updatedAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "state":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(state_default.refused),
            value: "-1"
          },
          {
            label: intl.formatMessage(state_default.toModerate),
            value: "0"
          },
          {
            label: intl.formatMessage(state_default.controlled),
            value: "1"
          },
          {
            label: intl.formatMessage(state_default.published),
            value: "2"
          }
        ],
        aggregation: {
          type: "states"
        }
      });
      break;
    case "search":
      (0, import_defaults.default)(filter, {
        type: "search",
        aggregation: null
      });
      break;
    case "locationUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "location.name",
        aggregation: {
          type: "locations"
        }
      });
      break;
    case "sourceAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "sourceAgendas"
        }
      });
      break;
    case "originAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "originAgendas"
        }
      });
      break;
    case "featured":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(featured_default.featured),
            value: "true"
          }
        ],
        aggregation: null
      });
      break;
    case "relative":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(relative_default.passed),
            value: "passed"
          },
          {
            label: intl.formatMessage(relative_default.current),
            value: "current"
          },
          {
            label: intl.formatMessage(relative_default.upcoming),
            value: "upcoming"
          }
        ]
      });
      break;
    case "attendanceMode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        aggregation: {
          type: "attendanceModes"
        },
        options: [
          {
            label: intl.formatMessage(attendanceMode_default.offline),
            value: "1"
          },
          {
            label: intl.formatMessage(attendanceMode_default.online),
            value: "2"
          },
          {
            label: intl.formatMessage(attendanceMode_default.mixed),
            value: "3"
          }
        ]
      });
      break;
    case "region":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "regions"
        }
      });
      break;
    case "department":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "departments"
        }
      });
      break;
    case "city":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "cities"
        }
      });
      break;
    case "countryCode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "countryCodes"
        }
      });
      break;
    case "adminLevel3":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "adminLevels3"
        }
      });
      break;
    case "district":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "districts"
        }
      });
      break;
    case "keyword":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        aggregation: {
          type: "keywords"
        }
      });
      break;
    case "status":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(status_default.programmed),
            value: "1"
          },
          {
            label: intl.formatMessage(status_default.rescheduled),
            value: "2"
          },
          {
            label: intl.formatMessage(status_default.movedOnline),
            value: "3"
          },
          {
            label: intl.formatMessage(status_default.postponed),
            value: "4"
          },
          {
            label: intl.formatMessage(status_default.full),
            value: "5"
          },
          {
            label: intl.formatMessage(status_default.cancelled),
            value: "6"
          }
        ],
        aggregation: {
          type: "status"
        }
      });
      break;
    case "favorites":
      (0, import_defaults.default)(filter, {
        type: "favorites",
        aggregation: null
      });
      break;
    default:
      break;
  }
  const { fieldSchema } = filter;
  if ((fieldSchema == null ? void 0 : fieldSchema.fieldType) === "boolean") {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: [
        {
          label: intl.formatMessage(boolean_default.selected),
          value: "true"
        },
        {
          label: intl.formatMessage(boolean_default.notSelected),
          value: "false"
        }
      ],
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      }
    });
  } else if (["number", "integer"].includes(fieldSchema == null ? void 0 : fieldSchema.fieldType)) {
    (0, import_defaults.default)(filter, {
      type: "numberRange",
      name: fieldSchema.field,
      fieldSchema,
      aggregation: null
    });
  } else if (fieldSchema) {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: !filter.aggregationOnly ? fieldSchema.options.map((option) => ({
        ...option,
        label: (0, import_intl.getLocaleValue)(option.label, intl.locale),
        value: String(option.id)
      })) : null,
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      },
      labelKey: "label"
    });
  }
  return filter;
}

// src/utils/getFiltersBase.js
function getFiltersBase(fields, opts = {}) {
  return [
    { name: "memberUid" },
    { name: "locationUid" },
    { name: "sourceAgendaUid" },
    { name: "originAgendaUid" },
    { name: "country" },
    { name: "region" },
    { name: "department" },
    { name: "city" },
    { name: "adminLevel3" },
    { name: "district" },
    { name: "keyword" }
  ].filter((filter) => {
    var _a;
    return !((_a = opts.exclude) == null ? void 0 : _a.includes(filter.name));
  }).map((filter) => withDefaultFilterConfig(filter, null, {
    dateFnsLocale: opts.dateFnsLocale,
    mapTiles: opts.mapTiles,
    missingValue: opts.missingValue
  }));
}
//# sourceMappingURL=getFiltersBase.cjs.map