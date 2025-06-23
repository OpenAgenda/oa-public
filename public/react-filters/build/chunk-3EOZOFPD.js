import {
  dateRanges
} from "./chunk-MH6TTOXL.js";
import {
  featured_default
} from "./chunk-LYGNDGH5.js";
import {
  provenance_default
} from "./chunk-MDJYSXSN.js";
import {
  relative_default
} from "./chunk-JNUN6VNQ.js";
import {
  state_default
} from "./chunk-S25O3HLE.js";
import {
  status_default
} from "./chunk-O3V5ZX3P.js";
import {
  accessibilities_default
} from "./chunk-EE7RHUDO.js";
import {
  attendanceMode_default
} from "./chunk-UPYWTXPR.js";
import {
  boolean_default
} from "./chunk-RW7NWBWL.js";

// src/utils/withDefaultFilterConfig.js
import defaults from "lodash/defaults.js";
import { getLocaleValue } from "@openagenda/intl";
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
      defaults(filter, {
        type: "none"
      });
      break;
    case "geo":
      defaults(filter, {
        type: "map",
        aggregation: null,
        // props for MapFilter
        tileAttribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: opts.mapTiles ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      });
      break;
    case "addMethod":
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
        type: "choice",
        options: null
      });
      break;
    case "memberUid":
      defaults(filter, {
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
      defaults(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "createdAt":
      defaults(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "updatedAt":
      defaults(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "state":
      defaults(filter, {
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
      defaults(filter, {
        type: "search",
        aggregation: null
      });
      break;
    case "locationUid":
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
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
      defaults(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        aggregation: {
          type: "keywords"
        }
      });
      break;
    case "status":
      defaults(filter, {
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
      defaults(filter, {
        type: "favorites",
        aggregation: null
      });
      break;
    default:
      break;
  }
  const { fieldSchema } = filter;
  if ((fieldSchema == null ? void 0 : fieldSchema.fieldType) === "boolean") {
    defaults(filter, {
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
    defaults(filter, {
      type: "numberRange",
      name: fieldSchema.field,
      fieldSchema,
      aggregation: null
    });
  } else if (fieldSchema) {
    defaults(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: !filter.aggregationOnly ? fieldSchema.options.map((option) => ({
        ...option,
        label: getLocaleValue(option.label, intl.locale),
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

export {
  withDefaultFilterConfig
};
//# sourceMappingURL=chunk-3EOZOFPD.js.map