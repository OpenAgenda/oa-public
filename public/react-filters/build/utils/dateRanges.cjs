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

// src/utils/dateRanges.js
var dateRanges_exports = {};
__export(dateRanges_exports, {
  createStaticRanges: () => createStaticRanges,
  default: () => dateRanges
});
module.exports = __toCommonJS(dateRanges_exports);
var import_date_fns = require("date-fns");
var import_react_intl = require("react-intl");
var messages = (0, import_react_intl.defineMessages)({
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
  const defaults = {
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
        const result = defaults.staticRanges.find((w) => w.id === next);
        if (result) accu.push(result);
        else console.log(`Cannot found static range "${next}"`);
      } else {
        accu.push(next);
      }
      return accu;
    }, []) : defaults.staticRanges,
    inputRanges: opts.inputRanges || defaults.inputRanges
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createStaticRanges
});
//# sourceMappingURL=dateRanges.cjs.map