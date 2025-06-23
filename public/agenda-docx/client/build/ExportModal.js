import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/public/agenda-docx/client/src/ExportModal.js";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import { Component } from 'react';
import sa from 'superagent';
import { Form, Field } from 'react-final-form';
import moment from 'moment';
import { formatDistanceToNow } from 'date-fns';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en-US';
import flattenLabels from './utils/flattenLabels.js';
import Modal from './Modal.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const locales = {
  fr,
  en
};
export default class ExportModal extends Component {
  constructor(props) {
    var _this;
    super(props);
    _this = this;
    _defineProperty(this, "dateToString", date => {
      const {
        locale
      } = this.props;
      return formatDistanceToNow(date, {
        locale: locales[locale]
      });
    });
    _defineProperty(this, "open", () => {
      this.send('get', '/state').then(body => {
        this.setState({
          service: body,
          open: true
        });
      });
    });
    _defineProperty(this, "queue", data => {
      this.send('post', '/queue', data).then(body => {
        this.setState({
          service: body
        });
      });
    });
    _defineProperty(this, "send", function (method, res) {
      let data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const {
        agendaUid,
        res: prefix
      } = _this.props;
      const {
        templateName,
        from,
        to
      } = data;
      _this.setState({
        loading: true
      });
      const request = sa[method]("".concat(prefix, "/").concat(agendaUid).concat(res));
      if (templateName) {
        request.query({
          templateName
        });
      }
      if (from) {
        request.query({
          from: from.toISOString().split('T').shift()
        });
      }
      if (to) {
        request.query({
          to: to.toISOString().split('T').shift()
        });
      }
      return request.then(_ref => {
        let {
          body
        } = _ref;
        return new _Promise(resolve => _this.setState({
          loading: false
        }, () => resolve(body)));
      });
    });
    _defineProperty(this, "renderGenerateForm", () => {
      const {
        labels,
        service,
        limitDates
      } = this.state;
      return /*#__PURE__*/_jsxDEV(Form, {
        onSubmit: this.queue,
        initialValues: {
          templateName: service.templates && service.templates.length ? service.templates[0].name : undefined
        },
        render: _ref2 => {
          let {
            handleSubmit,
            invalid
          } = _ref2;
          return /*#__PURE__*/_jsxDEV("form", {
            onSubmit: handleSubmit,
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "checkbox",
              children: /*#__PURE__*/_jsxDEV("label", {
                htmlFor: "limitDates",
                style: {
                  color: 'inherit'
                },
                children: [/*#__PURE__*/_jsxDEV("input", {
                  id: "limitDates",
                  type: "checkbox",
                  checked: limitDates,
                  onChange: e => this.setState({
                    limitDates: e.target.checked
                  })
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 175,
                  columnNumber: 17
                }, this), labels.limitDates]
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 174,
                columnNumber: 15
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 173,
              columnNumber: 13
            }, this), limitDates && /*#__PURE__*/_jsxDEV(_Fragment, {
              children: [/*#__PURE__*/_jsxDEV(Field, {
                name: "from",
                type: "date",
                format: value => value && value.format('YYYY-MM-DD'),
                parse: value => value && moment(value).startOf('day'),
                validate: (value, values) => {
                  if (values.to && moment(value).isAfter(values.to)) {
                    return labels.fromBeforeToError;
                  }
                },
                children: _ref3 => {
                  let {
                    input,
                    meta
                  } = _ref3;
                  return /*#__PURE__*/_jsxDEV("div", {
                    className: "form-group margin-all-sm",
                    children: [labels.from, ' ', /*#__PURE__*/_jsxDEV("div", {
                      style: {
                        display: 'inline-block'
                      },
                      children: /*#__PURE__*/_jsxDEV("input", _objectSpread(_objectSpread({}, input), {}, {
                        className: "form-control",
                        autoComplete: "off"
                      }), void 0, false, {
                        fileName: _jsxFileName,
                        lineNumber: 203,
                        columnNumber: 25
                      }, this)
                    }, void 0, false, {
                      fileName: _jsxFileName,
                      lineNumber: 202,
                      columnNumber: 23
                    }, this), meta.touched && meta.error && /*#__PURE__*/_jsxDEV("div", {
                      className: "text-danger",
                      children: meta.error
                    }, void 0, false, {
                      fileName: _jsxFileName,
                      lineNumber: 210,
                      columnNumber: 25
                    }, this)]
                  }, void 0, true, {
                    fileName: _jsxFileName,
                    lineNumber: 200,
                    columnNumber: 21
                  }, this);
                }
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 188,
                columnNumber: 17
              }, this), /*#__PURE__*/_jsxDEV(Field, {
                name: "to",
                type: "date",
                format: value => value && value.format('YYYY-MM-DD'),
                parse: value => value && moment(value).endOf('day'),
                validate: (value, values) => {
                  if (values.from && moment(value).isBefore(values.from)) {
                    return labels.toAfterFromError;
                  }
                },
                children: _ref4 => {
                  let {
                    input,
                    meta
                  } = _ref4;
                  return /*#__PURE__*/_jsxDEV("div", {
                    className: "form-group margin-bottom-sm margin-h-sm",
                    children: [labels.to, ' ', /*#__PURE__*/_jsxDEV("div", {
                      style: {
                        display: 'inline-block'
                      },
                      children: /*#__PURE__*/_jsxDEV("input", _objectSpread(_objectSpread({}, input), {}, {
                        className: "form-control",
                        autoComplete: "off"
                      }), void 0, false, {
                        fileName: _jsxFileName,
                        lineNumber: 231,
                        columnNumber: 25
                      }, this)
                    }, void 0, false, {
                      fileName: _jsxFileName,
                      lineNumber: 230,
                      columnNumber: 23
                    }, this), meta.touched && meta.error && /*#__PURE__*/_jsxDEV("div", {
                      className: "text-danger",
                      children: meta.error
                    }, void 0, false, {
                      fileName: _jsxFileName,
                      lineNumber: 238,
                      columnNumber: 25
                    }, this)]
                  }, void 0, true, {
                    fileName: _jsxFileName,
                    lineNumber: 228,
                    columnNumber: 21
                  }, this);
                }
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 216,
                columnNumber: 17
              }, this)]
            }, void 0, true), service.templates && service.templates.length ? /*#__PURE__*/_jsxDEV(_Fragment, {
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "margin-top-sm",
                children: labels.template
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 248,
                columnNumber: 17
              }, this), /*#__PURE__*/_jsxDEV("div", {
                className: "form-group",
                children: service.templates.map(template => /*#__PURE__*/_jsxDEV("div", {
                  className: "radio",
                  children: /*#__PURE__*/_jsxDEV("label", {
                    htmlFor: "templateName",
                    style: {
                      color: 'inherit'
                    },
                    children: [/*#__PURE__*/_jsxDEV(Field, {
                      id: "templateName",
                      name: "templateName",
                      component: "input",
                      type: "radio",
                      value: template.name
                    }, void 0, false, {
                      fileName: _jsxFileName,
                      lineNumber: 257,
                      columnNumber: 25
                    }, this), ' ', template.name]
                  }, void 0, true, {
                    fileName: _jsxFileName,
                    lineNumber: 253,
                    columnNumber: 23
                  }, this)
                }, template.name, false, {
                  fileName: _jsxFileName,
                  lineNumber: 252,
                  columnNumber: 21
                }, this))
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 250,
                columnNumber: 17
              }, this)]
            }, void 0, true) : null, /*#__PURE__*/_jsxDEV("div", {
              children: /*#__PURE__*/_jsxDEV("button", {
                type: "submit",
                className: "btn btn-primary",
                disabled: invalid,
                children: labels.generate
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 273,
                columnNumber: 15
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 272,
              columnNumber: 13
            }, this)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 172,
            columnNumber: 11
          }, this);
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 163,
        columnNumber: 7
      }, this);
    });
    _defineProperty(this, "renderQueueControl", function () {
      let asPrimary = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      const {
        labels
      } = _this.state;
      if (asPrimary) {
        return /*#__PURE__*/_jsxDEV("div", {
          className: "text-center margin-v-md",
          children: [/*#__PURE__*/_jsxDEV("div", {
            children: labels.launch
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 293,
            columnNumber: 11
          }, _this), _this.renderGenerateForm()]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 292,
          columnNumber: 9
        }, _this);
      }
      return /*#__PURE__*/_jsxDEV("div", {
        className: "text-center",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "margin-bottom-sm label-or",
          children: labels.or
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 302,
          columnNumber: 9
        }, _this), /*#__PURE__*/_jsxDEV("div", {
          children: labels.launch
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 303,
          columnNumber: 9
        }, _this), _this.renderGenerateForm()]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 301,
        columnNumber: 7
      }, _this);
    });
    this.state = {
      open: false,
      service: null,
      loading: false,
      labels: flattenLabels(props.labels, props.locale),
      limitDates: false
    };
    this.open = this.open.bind(this);
    this.queue = this.queue.bind(this);
    this.send = this.send.bind(this);
    this.renderGenerateForm = this.renderGenerateForm.bind(this);
    this.renderQueueControl = this.renderQueueControl.bind(this);
  }
  componentDidMount() {
    this.open();
  }
  render() {
    const {
      onClose
    } = this.props;
    const {
      open,
      service,
      labels
    } = this.state;
    const hasFile = service && service.file.name;
    const isQueued = service && service.queued;
    const svcState = _get(this.state, 'service', {});
    if (!open) {
      return null;
    }
    return /*#__PURE__*/_jsxDEV(Modal, {
      title: labels.modalTitle,
      onClose: onClose,
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "text-center margin-v-md",
        children: hasFile ? /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("div", {
            children: /*#__PURE__*/_jsxDEV("a", {
              className: "btn btn-primary",
              href: svcState.file.path,
              target: "_blank",
              rel: "noopener noreferrer",
              children: [labels.download, /*#__PURE__*/_jsxDEV("sup", {
                children: "(1)"
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 336,
                columnNumber: 19
              }, this)]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 329,
              columnNumber: 17
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 328,
            columnNumber: 15
          }, this), /*#__PURE__*/_jsxDEV("small", {
            children: [labels.lastUpdate, ":", ' ', this.dateToString(svcState.file.createdAt)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 339,
            columnNumber: 15
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 327,
          columnNumber: 13
        }, this) : /*#__PURE__*/_jsxDEV("p", {
          children: labels.noFileAvailable
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 345,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 325,
        columnNumber: 9
      }, this), isQueued ? /*#__PURE__*/_jsxDEV("p", {
        children: labels.queued
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 348,
        columnNumber: 21
      }, this) : this.renderQueueControl(!hasFile), hasFile ? /*#__PURE__*/_jsxDEV("div", {
        className: "margin-top-md",
        children: [/*#__PURE__*/_jsxDEV("sup", {
          children: "(1)"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 351,
          columnNumber: 13
        }, this), " : ", /*#__PURE__*/_jsxDEV("span", {
          children: labels.downloadInfo
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 351,
          columnNumber: 30
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 350,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 324,
      columnNumber: 7
    }, this);
  }
}
_defineProperty(ExportModal, "defaultProps", {
  labels: {
    modalLink: {
      en: 'Microsoft Word',
      fr: 'Microsoft Word'
    },
    modalTitle: {
      en: 'Word export',
      fr: 'Export word'
    },
    download: {
      en: 'Download the available file',
      fr: 'Téléchargez le fichier disponible'
    },
    lastUpdate: {
      en: 'Last update',
      fr: 'Dernière mise à jour'
    },
    noFileAvailable: {
      en: 'No file is available for download yet',
      fr: "Aucun fichier n'est encore disponible au téléchargement"
    },
    queued: {
      en: 'Your request has been queued and your file will be available shortly. Please check this menu again in a short while',
      fr: 'Votre demande est en cours de traitement. Rechargez ce menu dans quelques instants.'
    },
    launch: {
      en: 'Generate a new word file',
      fr: 'Générez un nouveau fichier word'
    },
    launchFromTemplate: {
      en: 'Generate a new word file from the template:',
      fr: 'Générez un nouveau fichier word à partir du gabarit :'
    },
    downloadInfo: {
      en: 'Update the table of content the first time you open the file with a right click on the table of content segment followed with a click on "Update"',
      fr: 'Mettez à jour le sommaire lors de la première ouverture du fichier en cliquant-droit dessus puis en selectionnant "Mettre à jour l\'index"'
    },
    or: {
      en: 'Or',
      fr: 'Ou'
    },
    from: {
      en: 'from',
      fr: 'du'
    },
    to: {
      en: 'to',
      fr: 'au'
    },
    template: {
      en: 'Template:',
      fr: 'Gabarit :'
    },
    generate: {
      en: 'Generate',
      fr: 'Générer'
    },
    toAfterFromError: {
      en: 'The start date must be before the end date.',
      fr: 'La date de début doit être avant la date de fin.'
    },
    fromBeforeToError: {
      en: 'The end date must be after the start date.',
      fr: 'La date de fin doit être après la date de début.'
    },
    limitDates: {
      en: 'Limit dates',
      fr: 'Limiter les dates'
    }
  }
});
//# sourceMappingURL=ExportModal.js.map