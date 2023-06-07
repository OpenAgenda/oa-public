import React, { Component } from 'react';
import DocxExportModal from '../build/ExportModal';
import flattenLabels from './utils/flattenLabels';
import ExportModal from './ExportModal';

export default class Main extends Component {
  static defaultProps = {
    labels: {
      modalLink: {
        en: 'Microsoft Word',
        fr: 'Microsoft Word',
      },
      modalTitle: {
        en: 'Word export',
        fr: 'Export word',
      },
      download: {
        en: 'Download the available file',
        fr: 'Téléchargez le fichier disponible',
      },
      lastUpdate: {
        en: 'Last update',
        fr: 'Dernière mise à jour',
      },
      noFileAvailable: {
        en: 'No file is available for download yet',
        fr: "Aucun fichier n'est encore disponible au téléchargement",
      },
      queued: {
        en:
          'Your request has been queued and your file will be available shortly. Please check this menu again in a short while',
        fr:
          'Votre demande est en cours de traitement. Rechargez ce menu dans quelques instants.',
      },
      launch: {
        en: 'Generate a new word file',
        fr: 'Générez un nouveau fichier word',
      },
      launchFromTemplate: {
        en: 'Generate a new word file from the template:',
        fr: 'Générez un nouveau fichier word à partir du gabarit :',
      },
      downloadInfo: {
        en:
          'Update the table of content the first time you open the file with a right click on the table of content segment followed with a click on "Update"',
        fr:
          'Mettez à jour le sommaire lors de la première ouverture du fichier en cliquant-droit dessus puis en selectionnant "Mettre à jour l\'index"',
      },
      or: {
        en: 'Or',
        fr: 'Ou',
      },
      from: {
        en: 'from',
        fr: 'du',
      },
      to: {
        en: 'to',
        fr: 'au',
      },
      template: {
        en: 'Template:',
        fr: 'Gabarit :',
      },
      generate: {
        en: 'Generate',
        fr: 'Générer',
      },
      toAfterFromError: {
        en: 'The start date must be before the end date.',
        fr: 'La date de début doit être avant la date de fin.',
      },
      fromBeforeToError: {
        en: 'The end date must be after the start date.',
        fr: 'La date de fin doit être après la date de début.',
      },
      limitDates: {
        en: 'Limit dates',
        fr: 'Limiter les dates',
      },
      eventsLimit: {
        en: 'The export can include a maximum of 1000 events per document.',
        fr: "L'export peut intégrer au maximum 1000 événements par document.",
      },
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      labels: flattenLabels(props.labels, props.locale),
    };
  }

  render() {
    const { locale, agendaUid } = this.props;
    const { open, labels } = this.state;

    const linkElem = (
      <div>
        <a href="#docx" onClick={() => this.setState({ open: true })}>
          {labels.modalLink}
        </a>
      </div>
    );

    if (!open) {
      return linkElem;
    }

    return (
      <>
        {linkElem}

        <ExportModal
          onClose={() => this.setState({ open: false })}
          locale={locale}
          agendaUid={agendaUid}
          res="/docx"
        />
      </>
    );
  }
}
