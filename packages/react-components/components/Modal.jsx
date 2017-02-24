"use strict";

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import bodyScroll from './body-scroll';


export default class Modal extends Component {

  static propTypes = {
    title: PropTypes.string,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    disableBodyScroll: PropTypes.bool
  };

  static defaultProps = {
    title: null,
    visible: true,
    disableBodyScroll: false,
    classNames: {
      overlay: 'popup-overlay'
    }
  };

  constructor( props ) {
    super( props );
    this.handleModalClick = ::this.handleModalClick;
    this.handleDocumentClick = ::this.handleDocumentClick;
    this.handleClose = ::this.handleClose;
    this.handleEsc = ::this.handleEsc;
  }

  state = {
    clickOnModal: false
  };

  componentDidUpdate() {

    if ( this.props.visible ) {

      this.addClickEvents();

    } else {

      this.removeClickEvents();

    }

  }

  addClickEvents() {

    ReactDOM.findDOMNode( this.modalRef ).addEventListener( 'click', this.handleModalClick );

    document.addEventListener( 'click', this.handleDocumentClick );
    document.addEventListener( 'keydown', this.handleEsc );

  }

  removeClickEvents() {

    ReactDOM.findDOMNode( this.modalRef ).removeEventListener( 'click', this.handleModalClick );

    document.removeEventListener( 'click', this.handleDocumentClick );
    document.removeEventListener( 'keydown', this.handleEsc );

  }

  componentDidMount() {

    if ( this.props.visible ) this.addClickEvents();

    if ( this.props.disableBodyScroll ) bodyScroll.disable();

  }

  componentWillUnmount() {

    this.removeClickEvents();

    if ( this.props.disableBodyScroll ) bodyScroll.enable();

  }

  handleModalClick() {

    this.state.clickOnModal = true;

  }

  handleDocumentClick( e ) {

    if ( this.props.visible && !this.state.clickOnModal ) {

      const area = ReactDOM.findDOMNode( this.modalRef );

      if ( !area.contains( e.target ) ) {
        this.handleClose();
      }

    }

    this.state.clickOnModal = false;
  }

  handleClose() {

    const { onClose } = this.props;

    if ( onClose ) onClose();

  }

  handleEsc( event ) {
    if ( event.key === 'Escape' ) this.handleClose();
  }

  render() {

    const { visible, title, children } = this.props;

    return (
      <div
        style={{ display: visible ? 'block' : 'none' }}
        className={this.props.classNames.overlay}
        onKeyPress={this.onKeyPress}
      >
        <section ref={ref => this.modalRef = ref}>
          { title ?
            <header className="popup-title">
              <h2>{title}</h2>
              <a onClick={this.handleClose} className="close-link">
                <i className="fa fa-times fa-lg" />
              </a>
            </header>
            : null }
          <div className="popup-content">
            {children}
          </div>
        </section>
      </div>
    );

  }

}