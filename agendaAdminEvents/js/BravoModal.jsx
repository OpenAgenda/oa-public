import React, { Component, PropTypes } from 'react';
import labels from 'labels/agenda-settings/bravo';
import makeGetterLabel from 'labels';
import dl from 'dom-utils/documentLocation';
import Modal from 'react-components/build/Modal';
import CopyToClipboard from 'react-copy-to-clipboard';

const getLabel = makeGetterLabel( labels );


export default class BravoModal extends Component {

  static propTypes = {
    lang: PropTypes.string,
    res: PropTypes.object
  }

  constructor() {
    super();
    this.state = {
      modalOpen: dl.getQueryPart( 'bravo' ) !== undefined
    };
  }

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

    return (
      <Modal
        onClose={this.closeModal}
        classNames={{ overlay: 'popup-overlay big' }}
        disableBodyScroll={true}
      >
        <div>
          <h2>{getLabel( 'title', this.props.lang )}</h2>
          <p className="text-muted">{getLabel( 'someActions', this.props.lang )}</p>
        </div>

        <div className="margin-v-xl">
          <p><b>{getLabel( 'addYourFirstEvent', this.props.lang )}</b></p>
          <div className="text-center">
            <a className="btn btn-primary" href={this.props.res.addEvent}>
              {getLabel( 'addEvent', this.props.lang )}
            </a>
          </div>
        </div>

        <p className="margin-v-md">
          <b>{getLabel( 'sendLink', this.props.lang )}</b><br />
          <span className="text-muted">
            {getLabel( 'copyLinkAndSend', this.props.lang )}
          </span>
        </p>
        <div className="input-group margin-bottom-md">
          <input type="text" className="form-control" value={window.location.origin + this.props.res.agenda} readOnly />
          <span className="input-group-btn">
            <CopyToClipboard text={window.location.origin + this.props.res.agenda || ''} onCopy={this.onCopied}>
              <button
                className="btn btn-primary btn-block"
                title={getLabel( 'copyLink', this.props.lang )}
              >
                <i className={`fa fa-${this.state.copied ? 'check' : 'clipboard'}`} aria-hidden="true"></i>
              </button>
            </CopyToClipboard>
          </span>
        </div>

        <div className="well text-right">
          <button className="btn btn-danger margin-top-md" onClick={this.closeModal}>
            {getLabel( 'close', this.props.lang )}
          </button>
        </div>
      </Modal>
    );
  }

}
