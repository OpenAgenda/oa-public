import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
var _jsxFileName = "/home/kaore/Dev/lib/oa/public/agenda-docx/client/src/Main.js";
import { Component } from 'react';
import flattenLabels from './utils/flattenLabels.js';
import ExportModal from './ExportModal.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      labels: flattenLabels(props.labels, props.locale)
    };
  }
  render() {
    const {
      locale,
      agendaUid
    } = this.props;
    const {
      open,
      labels
    } = this.state;
    const linkElem = /*#__PURE__*/_jsxDEV("div", {
      children: /*#__PURE__*/_jsxDEV("a", {
        href: "#docx",
        onClick: e => {
          e.preventDefault();
          this.setState({
            open: true
          });
        },
        children: labels.modalLink
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 93,
      columnNumber: 7
    }, this);
    if (!open) {
      return linkElem;
    }
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [linkElem, /*#__PURE__*/_jsxDEV(ExportModal, {
        onClose: () => this.setState({
          open: false
        }),
        locale: locale,
        agendaUid: agendaUid,
        res: "/docx"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 114,
        columnNumber: 9
      }, this)]
    }, void 0, true);
  }
}
_defineProperty(Main, "defaultProps", {
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
//# sourceMappingURL=Main.js.map