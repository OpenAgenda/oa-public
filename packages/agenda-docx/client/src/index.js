"use strict";

import _ from 'lodash';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import React, { Component } from 'react';
import { render } from 'react-dom';
import sa from 'superagent';

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

  }

  open() {

    if ( this.state.service ) {

      return this.setState( { open: true } );

    }

    this.send( 'get', '/state' ).then( body => {  

      this.setState( { service: body, loading: false, open: true } );

    } );

  }

  queue() {

    this.send( 'post', '/queue' ).then( body => {

      this.setState( { service: body, loading: false } );

    } );

  }

  send( method, res ) {

    this.setState( { loading: true } );

    return sa[ method ]( this.props.res + '/' + this.props.agendaUid + res ).then( ( { body } ) => body );

  }

  renderQueueControl( asPrimary = false ) {

    const { labels } = this.state;

    if ( asPrimary ) {

      return <div className="text-center margin-v-md">
        <button className="btn btn-primary" onClick={()=>this.queue()}>{labels.launch}</button>
      </div>

    }

    return <div className="text-center">
      <div className="margin-bottom-sm"><label>{labels.or}</label></div>
      <a onClick={()=>this.queue()}>{labels.launch}</a>
    </div>

  }

  render() {

    const { labels } = this.state;

    const hasFile = !!_.get( this.state, 'service.file.name', null );

    const svcState = _.get( this.state, 'service', {} );

    if ( !this.state.open ) {

      return <div><a 
        href="#docx"
        onClick={()=>this.open()}
      >{labels.modalLink}</a></div>

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
      {_.get( this.state, 'service.queued', false ) ? 
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
      en: 'Click here',
      fr: 'Cliquez ici'
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
    downloadInfo: {
      en: 'Update the table of content the first time you open the file with a right click on the table of content segment followed with a click on "Update"',
      fr: 'Mettez à jour le sommaire lors de la première ouverture du fichier en cliquant-droit dessus puis en selectionnant "Mettre à jour l\'index"'
    },
    or: {
      en: 'Or',
      fr: 'Ou'
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