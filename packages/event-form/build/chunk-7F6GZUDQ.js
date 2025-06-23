// src/fields/event.js
var event_default = ({ labels }) => [
  {
    field: "id",
    fieldType: "integer",
    optional: false,
    read: ["internal"],
    write: ["internal"]
  },
  {
    field: "uid",
    fieldType: "integer",
    optional: false,
    write: ["internal"]
  },
  {
    field: "slug",
    fieldType: "text",
    optional: false,
    write: ["internal"]
  },
  {
    field: "private",
    fieldType: "boolean",
    default: false,
    write: ["internal"]
  },
  {
    field: "timezone",
    fieldType: "text",
    write: ["internal"]
  },
  {
    field: "draft",
    fieldType: "boolean",
    default: false,
    write: ["internal"]
  },
  {
    field: "createdAt",
    fieldType: "date",
    write: ["internal"]
  },
  {
    field: "creatorUid",
    fieldType: "integer",
    write: ["internal"]
  },
  {
    field: "ownerUid",
    fieldType: "integer",
    write: ["internal"]
  },
  {
    field: "updatedAt",
    fieldType: "date",
    write: ["internal"]
  },
  {
    field: "agendaUid",
    fieldType: "integer",
    optional: false,
    write: ["internal"]
  },
  {
    field: "fileKey",
    fieldType: "text",
    write: ["internal"]
  },
  {
    field: "locationUid",
    fieldType: "integer",
    optional: false,
    write: ["internal"]
  },
  {
    field: "image",
    fieldType: "image",
    optional: true,
    label: labels == null ? void 0 : labels.image,
    info: labels == null ? void 0 : labels.imageInfo,
    allowURL: true,
    allowPath: true,
    imageWithSizeAndVariants: true,
    extensions: ["jpg", "bmp", "png", "jpeg", "webp"]
  },
  {
    field: "imageCredits",
    fieldType: "text",
    optional: true,
    label: labels == null ? void 0 : labels.imageCredits,
    enableWith: "image",
    max: 255
  },
  {
    field: "languages",
    fieldType: "languages",
    label: labels == null ? void 0 : labels.languages
  },
  {
    languages: [],
    field: "title",
    fieldType: "text",
    optional: false,
    max: 150,
    label: labels == null ? void 0 : labels.title,
    placeholder: labels == null ? void 0 : labels.titlePlaceholder,
    purpose: labels == null ? void 0 : labels.titlePurpose,
    sub: labels == null ? void 0 : labels.titleSub
  },
  {
    languages: [],
    field: "description",
    fieldType: "text",
    optional: false,
    max: 200,
    label: labels == null ? void 0 : labels.description,
    purpose: labels == null ? void 0 : labels.descriptionPurpose,
    placeholder: labels == null ? void 0 : labels.descriptionPlaceholder,
    sub: labels == null ? void 0 : labels.descriptionSub
  },
  {
    languages: [],
    field: "keywords",
    fieldType: "keywords",
    optional: true,
    max: 255,
    label: labels == null ? void 0 : labels.keywords,
    placeholder: labels == null ? void 0 : labels.keywordsPlaceholder,
    sub: labels == null ? void 0 : labels.keywordsSub
  },
  {
    languages: [],
    field: "longDescription",
    fieldType: "longDescription",
    label: labels == null ? void 0 : labels.longDescription,
    max: 1e4,
    sub: labels == null ? void 0 : labels.longDescriptionSub,
    placeholder: labels == null ? void 0 : labels.longDescriptionPlaceholder
  },
  {
    languages: [],
    field: "conditions",
    fieldType: "text",
    label: labels == null ? void 0 : labels.conditions,
    max: 255,
    placeholder: labels == null ? void 0 : labels.conditionsPlaceholder,
    sub: labels == null ? void 0 : labels.conditionsSub
  },
  {
    field: "age",
    fieldType: "age",
    optional: true,
    label: labels == null ? void 0 : labels.age
  },
  {
    field: "accessibility",
    fieldType: "accessibility",
    optional: true,
    label: labels == null ? void 0 : labels.accessibility
  },
  {
    display: false,
    field: "attendanceMode",
    fieldType: "radio",
    label: labels == null ? void 0 : labels.attendanceMode,
    optional: false,
    default: 1,
    options: [
      {
        id: 1,
        value: "offline",
        label: labels == null ? void 0 : labels.offlineAttendanceMode,
        info: labels == null ? void 0 : labels.offlineAttendanceModeInfo
      },
      {
        id: 2,
        value: "online",
        label: labels == null ? void 0 : labels.onlineAttendanceMode,
        info: labels == null ? void 0 : labels.onlineAttendanceModeInfo
      },
      {
        id: 3,
        value: "mixed",
        label: labels == null ? void 0 : labels.mixedAttendanceMode,
        info: labels == null ? void 0 : labels.mixedAttendanceModeInfo
      }
    ]
  },
  {
    field: "location",
    fieldType: "location",
    label: labels == null ? void 0 : labels.location,
    sub: labels == null ? void 0 : labels.locationSub,
    optionalWith: {
      field: "attendanceMode",
      value: 2
    },
    disableChange: false,
    selfHandled: ["sub"]
  },
  {
    display: false,
    field: "onlineAccessLink",
    fieldType: "link",
    label: labels == null ? void 0 : labels.onlineAccessLink,
    optional: false,
    enableWith: {
      field: "attendanceMode",
      value: [2, 3]
    }
  },
  {
    field: "status",
    fieldType: "select",
    default: 1,
    display: false,
    label: labels == null ? void 0 : labels.status,
    options: [
      {
        id: 1,
        value: "scheduled",
        label: labels == null ? void 0 : labels.scheduled
      },
      {
        id: 2,
        value: "rescheduled",
        label: labels == null ? void 0 : labels.rescheduled
      },
      {
        id: 3,
        value: "movedOnline",
        label: labels == null ? void 0 : labels.movedOnline
      },
      {
        id: 4,
        value: "postponed",
        label: labels == null ? void 0 : labels.postponed
      },
      {
        id: 5,
        value: "full",
        label: labels == null ? void 0 : labels.full
      },
      {
        id: 6,
        value: "cancelled",
        label: labels == null ? void 0 : labels.cancelled
      }
    ]
  },
  {
    field: "timings",
    fieldType: "timings",
    max: 800,
    optional: false,
    label: labels == null ? void 0 : labels.timings,
    info: labels == null ? void 0 : labels.timingsInfo,
    helpLink: "https://doc.openagenda.com/saisir-les-horaires-de-votre-evenement/"
  },
  {
    field: "registration",
    fieldType: "registration",
    label: labels == null ? void 0 : labels.registration,
    info: labels == null ? void 0 : labels.registrationInfo,
    placeholder: labels == null ? void 0 : labels.registrationPlaceholder,
    sub: labels == null ? void 0 : labels.registrationSub,
    related: {
      other: ["timings", "location", "longDescription", "title", "conditions"]
    },
    selfHandled: ["info"]
  },
  {
    field: "links",
    fieldType: "enrichedLinks",
    optional: true,
    write: ["internal"]
  },
  {
    field: "extIds",
    fieldType: "extIds",
    optional: true,
    display: false,
    label: labels == null ? void 0 : labels.extIds
  }
];

export {
  event_default
};
//# sourceMappingURL=chunk-7F6GZUDQ.js.map