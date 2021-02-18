import _ from 'lodash';
import React, { Component } from 'react';
import sa from 'superagent';
import { Form, Field } from 'react-final-form';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en';
import flattenLabels from './utils/flattenLabels';
import Modal from './Modal';

const locales = { fr, en };

export default class ExportModal extends Component {
  static defaultProps = {
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
        en:
          'Your request has been queued and your file will be available shortly. Please check this menu again in a short while',
        fr:
          'Votre demande est en cours de traitement. Rechargez ce menu dans quelques instants.'
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
        en:
          'Update the table of content the first time you open the file with a right click on the table of content segment followed with a click on "Update"',
        fr:
          'Mettez à jour le sommaire lors de la première ouverture du fichier en cliquant-droit dessus puis en selectionnant "Mettre à jour l\'index"'
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
      },
      eventsLimit: {
        en: 'The export can include a maximum of 1000 events per document.',
        fr: "L'export peut intégrer au maximum 1000 événements par document."
      }
    }
  };

  constructor(props) {
    super(props);

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

  dateToString = date => {
    const { locale } = this.props;

    return distanceInWordsToNow(date, { locale: locales[locale] });
  };

  open = () => {
    this.send('get', '/state').then(body => {
      this.setState({ service: body, open: true });
    });
  };

  queue = data => {
    this.send('post', '/queue', data).then(body => {
      this.setState({ service: body });
    });
  };

  send = (method, res, data = {}) => {
    const { agendaUid, res: prefix } = this.props;
    const { templateName, from, to } = data;

    this.setState({ loading: true });

    const request = sa[method](`${prefix}/${agendaUid}${res}`);

    if (templateName) {
      request.query({ templateName });
    }

    if (from) {
      request.query({
        from: from
          .toISOString()
          .split('T')
          .shift()
      });
    }

    if (to) {
      request.query({
        to: to
          .toISOString()
          .split('T')
          .shift()
      });
    }

    return request.then(
      ({ body }) => new Promise(resolve => this.setState({ loading: false }, () => resolve(body)))
    );
  };

  renderGenerateForm = () => {
    const { locale } = this.props;
    const { labels, service, limitDates } = this.state;

    return (
      <Form
        onSubmit={this.queue}
        initialValues={{
          templateName:
            service.templates && service.templates.length
              ? service.templates[0].name
              : undefined
        }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <div className="checkbox">
              <label htmlFor="limitDates" style={{ color: 'inherit' }}>
                <input
                  id="limitDates"
                  type="checkbox"
                  checked={limitDates}
                  onChange={e => this.setState({ limitDates: e.target.checked })}
                />
                {labels.limitDates}
              </label>
            </div>

            {limitDates && (
              <>
                <Field
                  name="from"
                  format={value => value && value.startOf('day').toISOString()}
                  parse={value => value && moment(value)}
                  validate={(value, values) => {
                    if (values.to && moment(value).isAfter(values.to)) {
                      return labels.fromBeforeToError;
                    }
                  }}
                >
                  {({ input, meta }) => (
                    <div className="form-group margin-all-sm">
                      {labels.from}{' '}
                      <div style={{ display: 'inline-block' }}>
                        <DatePicker
                          {...input}
                          locale={locale}
                          className="form-control"
                          selected={
                            input.value ? moment(input.value) : input.value
                          }
                          value={
                            input.value
                              ? moment(input.value)
                                .locale(locale)
                                .format('LL')
                              : input.value
                          }
                          autoComplete="off"
                        />
                      </div>
                      {meta.touched && meta.error && (
                        <div className="text-danger">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>

                <Field
                  name="to"
                  format={value => value && value.endOf('day').toISOString()}
                  parse={value => value && moment(value)}
                  validate={(value, values) => {
                    if (values.from && moment(value).isBefore(values.from)) {
                      return labels.toAfterFromError;
                    }
                  }}
                >
                  {({ input, meta }) => (
                    <div className="form-group margin-bottom-sm margin-h-sm">
                      {labels.to}{' '}
                      <div style={{ display: 'inline-block' }}>
                        <DatePicker
                          {...input}
                          locale={locale}
                          className="form-control"
                          selected={
                            input.value ? moment(input.value) : input.value
                          }
                          value={
                            input.value
                              ? moment(input.value)
                                .locale(locale)
                                .format('LL')
                              : input.value
                          }
                          autoComplete="off"
                        />
                      </div>
                      {meta.touched && meta.error && (
                        <div className="text-danger">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>
              </>
            )}

            {service.templates && service.templates.length ? (
              <>
                <p className="margin-top-sm">{labels.template}</p>

                <div className="form-group">
                  {service.templates.map(template => (
                    <div className="radio" key={template.name}>
                      <label
                        htmlFor="templateName"
                        style={{ color: 'inherit' }}
                      >
                        <Field
                          id="templateName"
                          name="templateName"
                          component="input"
                          type="radio"
                          value={template.name}
                        />{' '}
                        {template.name}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={invalid}
              >
                {labels.generate}
              </button>
            </div>
          </form>
        )}
      />
    );
  };

  renderQueueControl = (asPrimary = false) => {
    const { labels } = this.state;

    if (asPrimary) {
      return (
        <div className="text-center margin-v-md">
          <div>{labels.launch}</div>

          {this.renderGenerateForm()}
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="margin-bottom-sm label-or">{labels.or}</div>
        <div>{labels.launch}</div>

        {this.renderGenerateForm()}
      </div>
    );
  };

  render() {
    const { onClose } = this.props;
    const { open, service, labels } = this.state;

    const hasFile = service && service.file.name;
    const isQueued = service && service.queued;

    const svcState = _.get(this.state, 'service', {});

    if (!open) {
      return null;
    }

    return (
      <Modal
        title={labels.modalTitle}
        onClose={onClose}
      >
        <div className="text-center margin-v-md">
          {hasFile ? (
            <div>
              <div>
                <a
                  className="btn btn-primary"
                  href={svcState.file.path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {labels.download}
                  <sup>(1)</sup>
                </a>
              </div>
              <small>
                {labels.lastUpdate}:{' '}
                {this.dateToString(svcState.file.createdAt)}
              </small>
            </div>
          ) : (
            <p>{labels.noFileAvailable}</p>
          )}
        </div>
        {isQueued ? <p>{labels.queued}</p> : this.renderQueueControl(!hasFile)}
        {!isQueued ? <span>{labels.eventsLimit}</span> : null}
        {hasFile ? (
          <div className="margin-top-md">
            <sup>(1)</sup> : <span>{labels.downloadInfo}</span>
          </div>
        ) : null}
      </Modal>
    );
  }
}
