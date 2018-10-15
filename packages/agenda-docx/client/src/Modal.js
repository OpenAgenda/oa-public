"use strict";

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import bodyScroll from './utils/bodyScroll';


export default class Modal extends Component {

  static propTypes = {
    title: PropTypes.node,
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
    this.handleOverlayClick = ::this.handleOverlayClick;
    this.handleClose = ::this.handleClose;
    this.handleEsc = ::this.handleEsc;
    this.setModalRef = ::this.setModalRef;
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

    const modalDomNode = ReactDOM.findDOMNode( this.modalRef );
    const overlayDomNode = ReactDOM.findDOMNode( this.overlayRef );

    if ( modalDomNode ) modalDomNode.addEventListener( 'click', this.handleModalClick );
    if ( overlayDomNode ) overlayDomNode.addEventListener( 'click', this.handleOverlayClick );

    document.addEventListener( 'keydown', this.handleEsc );

  }

  removeClickEvents() {

    const modalDomNode = ReactDOM.findDOMNode( this.modalRef );
    const overlayDomNode = ReactDOM.findDOMNode( this.overlayRef );

    if ( modalDomNode ) modalDomNode.removeEventListener( 'click', this.handleModalClick );
    if ( overlayDomNode ) overlayDomNode.removeEventListener( 'click', this.handleOverlayClick );

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

  handleOverlayClick( e ) {

    if ( this.props.visible && !this.state.clickOnModal ) {

      this.handleClose();

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

  setModalRef( ref ) {
    this.modalRef = ref;
    if ( this.props.modalRef ) this.props.modalRef( ref );
  }

  getModalRef() {
    return this.modalRef;
  }

  render() {

    const { title, children, visible } = this.props;

    if ( !visible ) {
      return null;
    }

    return (
      <div
        className={this.props.classNames.overlay}
        onKeyPress={this.onKeyPress}
        ref={ref => this.overlayRef = ref}
      >
        <section ref={this.setModalRef}>
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