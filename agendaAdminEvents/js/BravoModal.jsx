import React, { Component, PropTypes } from 'react';
import labels from 'labels/agenda-settings/bravo';
import makeGetterLabel from 'labels';
import dl from 'dom-utils/documentLocation';
import Modal from 'react-components/build/Modal';
import CopyToClipboard from 'react-copy-to-clipboard';
import ImageUpload from 'image-upload';

const getLabel = makeGetterLabel( labels );


export default class BravoModal extends Component {

  static propTypes = {
    lang: PropTypes.string,
    res: PropTypes.object,
    image: PropTypes.string
  }

  state = {
    modalOpen: dl.getQueryPart( 'bravo' ) !== undefined,
    image: this.props.image
  };

  imageUploaded = ( image, error ) => {
    if ( error ) return;
    this.setState( { image } );
  };

  closeModal = () => {

    dl.setQueryPart( { bravo: undefined } );
    this.setState( { modalOpen: false } );

  }

  onCopied = () => {

    this.setState( { copied: true } );

    setTimeout( () => this.setState( { copied: false } ), 1500 );

  }

  render() {

    if ( !this.state.modalOpen ) return null;

    const { lang, res } = this.props;

    return (
      <Modal
        onClose={this.closeModal}
        classNames={{ overlay: 'popup-overlay big' }}
        disableBodyScroll={true}
      >
        <div>
          <h2>{getLabel( 'title', lang )}</h2>
          <p className="text-muted">{getLabel( 'someActions', lang )}</p>
        </div>

        <div className="margin-v-xl">
          <p><b>{getLabel( 'addYourFirstEvent', lang )}</b></p>
          <div className="text-center">
            <a className="btn btn-primary" href={res.addEvent}>
              {getLabel( 'addEvent', lang )}
            </a>
          </div>
        </div>

        <ImageUpload
          frameName="bravoModalSetImage"
          lang={lang}
          value={this.state.image}
          handleUpdate={this.imageUploaded}
          upload={res.setImage}
          remove={res.clearImage}
          rand={false}
        />

        <div className="margin-v-xl">
          <b>{getLabel( 'sendLink', lang )}</b><br />
          <span className="text-muted">
            {getLabel( 'copyLinkAndSend', lang )}
          </span>
          <div className="input-group margin-top-md">
            <input type="text" className="form-control" value={window.location.origin + res.agenda} readOnly />
            <span className="input-group-btn">
            <CopyToClipboard text={window.location.origin + res.agenda || ''} onCopy={this.onCopied}>
              <button
                className="btn btn-primary btn-block"
                title={getLabel( 'copyLink', lang )}
              >
                <i className={`fa fa-${this.state.copied ? 'check' : 'clipboard'}`} aria-hidden="true"></i>
              </button>
            </CopyToClipboard>
          </span>
          </div>
        </div>

        <div className="well text-right">
          <button className="btn btn-danger margin-top-md" onClick={this.closeModal}>
            {getLabel( 'close', lang )}
          </button>
        </div>
      </Modal>
    );
  }

}
