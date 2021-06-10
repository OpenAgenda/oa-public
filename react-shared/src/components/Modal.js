import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as bodyScroll from './body-scroll';

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

  state = {
    clickOnModal: false
  };

  componentDidUpdate = () => {
    if (this.props.visible) {
      this.addClickEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.disable();
      }
    } else {
      this.removeClickEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.enable();
      }
    }
  }

  addClickEvents = () => {
    const modalDomNode = ReactDOM.findDOMNode(this.modalRef);
    const overlayDomNode = ReactDOM.findDOMNode(this.overlayRef);

    if (modalDomNode) modalDomNode.addEventListener('mousedown', this.handleModalClick);
    if (overlayDomNode) overlayDomNode.addEventListener('click', this.handleOverlayClick);

    document.addEventListener('keydown', this.handleEsc);
  }

  removeClickEvents = () => {
    const modalDomNode = ReactDOM.findDOMNode(this.modalRef);
    const overlayDomNode = ReactDOM.findDOMNode(this.overlayRef);

    if (modalDomNode) modalDomNode.removeEventListener('mousedown', this.handleModalClick);
    if (overlayDomNode) overlayDomNode.removeEventListener('click', this.handleOverlayClick);

    document.removeEventListener('keydown', this.handleEsc);
  }

  componentDidMount = () => {
    if (this.props.visible) {
      this.addClickEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.disable();
      }
    }
  }

  componentWillUnmount = () => {
    this.removeClickEvents();

    if (this.props.disableBodyScroll) {
      bodyScroll.enable();
    }
  }

  handleModalClick = () => {
    this.setState({
      clickOnModal: true
    });
  }

  handleOverlayClick = () => {
    if (this.props.visible && !this.state.clickOnModal) {
      this.handleClose();
    }

    this.setState({
      clickOnModal: false
    });
  }

  handleClose = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }
  }

  handleEsc = event => {
    if (event.key === 'Escape') this.handleClose();
  }

  setModalRef = ref => {
    this.modalRef = ref;

    if (this.props.modalRef) {
      this.props.modalRef(ref);
    }
  }

  render() {
    const { title, children, visible } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div
        className={this.props.classNames.overlay}
        onKeyPress={this.onKeyPress}
        ref={this.overlayRef}
      >
        <section ref={this.setModalRef}>
          {title ? (
            <header className="popup-title">
              <h2>{title}</h2>
              <a onClick={this.handleClose} className="close-link">
                <i className="fa fa-times fa-lg" />
              </a>
            </header>
          ) : null}
          <div className="popup-content">
            {children}
          </div>
        </section>
      </div>
    );
  }
}
