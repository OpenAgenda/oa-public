import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import deepExtend from 'deep-extend';
import CopyToClipboard from 'react-copy-to-clipboard';
import makeGetterLabel from '@openagenda/labels';
import ImageUpload from '@openagenda/image-upload';
import labels from '@openagenda/labels/agenda-admin/gettingStarted';
import openRequestForm from '@openagenda/call-to-action/dist/openRequestForm';


const defaults = {
  lang: 'fr',
  res: {
    agenda: '#',
    setImage: '#',
    clearImage: '#',
    addEvent: '#',
    createEmbed: '#'
  }
};

window.hook( options => {

  const { lang, res } = deepExtend( {}, defaults, options );

  const getLabel = makeGetterLabel( labels, lang );

  ReactDOM.render( <GettingStarted lang={lang} res={res} getLabel={getLabel} />,
    document.querySelector( '.js_canvas' ) );

} );


class GettingStarted extends Component {

  static propTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string,
    res: PropTypes.object,
    image: PropTypes.string
  }

  state = {
    copied: false,
    image: this.props.image
  };

  imageUploaded = ( image, error ) => {
    if ( error ) return;
    this.setState( { image } );
  };

  onCopied = () => {

    this.setState( { copied: true } );

    setTimeout( () => this.setState( { copied: false } ), 1500 );

  }

  render() {

    const { lang, res, getLabel } = this.props;

    return (
      <div>
        <div>
          <h2>{getLabel( 'title' )}</h2>
          <p className="text-muted">{getLabel( 'someActions' )}</p>
        </div>

        <div className="margin-v-lg">
          <p><b>{getLabel( 'addYourFirstEvent' )}</b></p>
          <div className="margin-v-md">
            <a className="btn btn-primary" href={res.addEvent}>
              {getLabel( 'addEvent' )}
            </a>
          </div>
        </div>

        <div className="margin-v-lg">
          <b>{getLabel( 'addProfileImage' )}</b><br />
          <div className="margin-top-md">
            <ImageUpload
              label={false}
              frameName="bravoModalSetImage"
              lang={lang}
              value={this.state.image}
              handleUpdate={this.imageUploaded}
              upload={res.setImage}
              remove={res.clearImage}
              rand={false}
            />
          </div>
        </div>

        <div className="margin-v-lg">
          <b>{getLabel( 'sendLink' )}</b><br />
          <span className="text-muted">
            {getLabel( 'copyLinkAndSend' )}
          </span>
          <div className="row">
            <div className="input-group margin-top-md col-md-8 margin-left-sm">
              <input
                type="text"
                className="form-control"
                defaultValue={window.location.origin + res.agenda || ''}
                readOnly
              />
              <span className="input-group-btn">
                <CopyToClipboard text={window.location.origin + res.agenda || ''} onCopy={this.onCopied}>
                  <button className="btn btn-primary btn-block" title={getLabel( 'copyLink' )}>
                    <i className={`fa fa-${this.state.copied ? 'check' : 'clipboard'}`} aria-hidden="true" />
                  </button>
                </CopyToClipboard>
              </span>
            </div>
          </div>
        </div>

        <div className="margin-v-lg">
          <p><b>{getLabel( 'embedYourAgenda' )}</b></p>
          <div className="margin-v-md">
            <a className="btn btn-primary" href={res.createEmbed}>
              {getLabel( 'createEmbedded' )}
            </a>
          </div>
        </div>

        <div className="margin-v-lg">
          <p><b>{getLabel( 'needPrivate' )}</b></p>
          <div className="margin-v-md">
            <button className="btn btn-primary" href={res.createEmbed} onClick={() => openRequestForm( {
              lang,
              subject: 'privateAgenda',
              agenda: res.agenda
            } )}>
              {getLabel( 'requestPrivate' )}
            </button>
          </div>
        </div>

        <div className="margin-v-lg">
          <p><b>{getLabel( 'needOfficial' )}</b></p>
          <div className="margin-v-md">
            <button className="btn btn-primary" href={res.createEmbed} onClick={() => openRequestForm( {
              lang,
              subject: 'officialAgenda',
              agenda: res.agenda
            } )}>
              {getLabel( 'requestOfficial' )}
            </button>
          </div>
        </div>
      </div>
    );

  }

}
