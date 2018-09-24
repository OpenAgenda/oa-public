"use strict";

import _ from 'lodash';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import sa from 'superagent';
import { Form, Field } from 'react-final-form';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import flattenLabels from './utils/flattenLabels';

const locales = {
  fr: require( 'date-fns/locale/fr' ),
  en: require( 'date-fns/locale/en' )
}


if ( module.hot ) module.hot.accept();

import Modal from './Modal';

const anchor = _.first( document.getElementsByClassName( 'js_oa_docx_anchor' ) );

class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      open: false,
      service: null,
      loading: false,
      labels: flattenLabels( this.props.labels, this.props.locale )
    }

    this.dateToString = date => distanceInWordsToNow( date, { locale: locales[ this.props.locale ] } );

    this.open = this.open.bind( this );
    this.queue = this.queue.bind( this );
    this.send = this.send.bind( this );
    this.renderGenerateForm = this.renderGenerateForm.bind( this );
    this.renderQueueControl = this.renderQueueControl.bind( this );

  }

  open() {

    this.send( 'get', '/state' ).then( body => {

      this.setState( { service: body, open: true } );

    } );

  }

  queue( data ) {

    this.send( 'post', '/queue', data ).then( body => {

      this.setState( { service: body } );

    } );

  }

  send( method, res, data = {} ) {

    const { templateName, from, to } = data;

    this.setState( { loading: true } );

    const request = sa[ method ]( this.props.res + '/' + this.props.agendaUid + res );

    if ( templateName ) {
      request.query( { templateName } );
    }

    if ( from ) {
      request.query( { from: from.toISOString() } );
    }

    if ( to ) {
      request.query( { to: to.toISOString() } );
    }

    return request
      .then( ( { body } ) =>
        new Promise( resolve =>
          this.setState( { loading: false }, () => resolve( body ) )
        )
      );

  }

  renderGenerateForm() {

    const { locale } = this.props;
    const { labels, service } = this.state;

    return (
      <Form
        onSubmit={this.queue}
        initialValues={{
          templateName: service.templates && service.templates.length ? service.templates[ 0 ].name : undefined
        }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>

            <Field
              name="from"
              format={value => value && value.startOf( 'day' ).toISOString()}
              parse={value => value && moment( value )}
              validate={( value, values ) => {
                if ( values.to && moment( value ).isAfter( values.to ) ) {
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
                      selected={input.value ? moment( input.value ) : input.value}
                      value={input.value ? moment( input.value ).locale( locale ).format( 'LL' ) : input.value}
                      autoComplete="off"
                    />
                  </div>
                  {meta.touched && meta.error && <div className="text-danger">{meta.error}</div>}
                </div>
              )}
            </Field>

            <Field
              name="to"
              format={value => value && value.endOf( 'day' ).toISOString()}
              parse={value => value && moment( value )}
              validate={( value, values ) => {
                if ( values.from && moment( value ).isBefore( values.from ) ) {
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
                      selected={input.value ? moment( input.value ) : input.value}
                      value={input.value ? moment( input.value ).locale( locale ).format( 'LL' ) : input.value}
                      autoComplete="off"
                    />
                  </div>
                  {meta.touched && meta.error && <div className="text-danger">{meta.error}</div>}
                </div>
              )}
            </Field>

            {service.templates && service.templates.length ? (
              <Fragment>
                <p>{labels.template}</p>

                <div className="form-group">
                  {service.templates.map( ( template, index ) => (
                    <div className="radio" key={index}>
                      <label style={{ color: 'inherit' }}>
                        <Field name="templateName" component="input" type="radio" value={template.name} />
                        {' '}
                        {template.name}
                      </label>
                    </div>
                  ) )}
                </div>
              </Fragment>
            ) : null}

            <div>
              <button type="submit" className="btn btn-primary" disabled={invalid}>
                {labels.generate}
              </button>
            </div>

          </form>
        )}
      />
    );

  }

  renderQueueControl( asPrimary = false ) {

    const { labels } = this.state;

    if ( asPrimary ) {

      return (
        <div className="text-center margin-v-md">
          <div>{labels.launch}</div>

          {this.renderGenerateForm()}
        </div>
      );

    }

    return (
      <div className="text-center">
        <div className="margin-bottom-sm"><label>{labels.or}</label></div>
        <div>{labels.launch}</div>

        {this.renderGenerateForm()}
      </div>
    );

  }

  render() {

    const { labels } = this.state;

    const hasFile = this.state.service && this.state.service.file.name;
    const isQueued = this.state.service && this.state.service.queued;

    const svcState = _.get( this.state, 'service', {} );

    if ( !this.state.open ) {

      return (
        <div>
          <a href="#docx" onClick={() => this.open()}>
            {labels.modalLink}
          </a>
        </div>
      );

    }

    return <Modal
      title={labels.modalTitle}
      onClose={()=> this.setState( { open: false } )}
    >
      <div className="text-center margin-v-md">
      { hasFile ? <div>
          <div>
            <a className="btn btn-primary" href={svcState.file.path} target="_blank">{labels.download} <sup>(1)</sup></a>
          </div>
          <small>{labels.lastUpdate}: {this.dateToString( svcState.file.createdAt)}</small>
        </div>
      : <p>{labels.noFileAvailable}</p>
       }
      </div>
      { isQueued ?
        <p>{labels.queued}</p>
       : this.renderQueueControl(!hasFile) }
      { hasFile ? <div className="margin-top-md">
        <sup>(1)</sup> : <span>{labels.downloadInfo}</span>
      </div> : null }
    </Modal>

  }

}

Main.defaultProps = {

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
      fr: 'Aucun fichier n\'est encore disponible au téléchargement'
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
      en: '',
      fr: 'La date de début doit être avant la date de fin.'
    },
    fromBeforeToError: {
      en: '',
      fr: 'La date de fin doit être après la date de début.'
    }
  }

}


const props = {
  locale: anchor.getAttribute( 'data-locale' ) || 'fr',
  agendaUid: anchor.getAttribute( 'data-agenda-uid' ),
  labels: anchor.getAttribute( 'data-labels' ) || undefined,
  res: anchor.getAttribute( 'data-res' ) || '#res'
}

render( <Main {...props} />, anchor );
