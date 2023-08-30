import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as bodyScroll from './utils/bodyScroll';

export default class Modal extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.node,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    disableBodyScroll: PropTypes.bool,
    classNames: PropTypes.objectOf(PropTypes.string),
  };

  static defaultProps = {
    children: null,
    title: null,
    visible: true,
    disableBodyScroll: false,
    onClose: null,
    classNames: {
      overlay: 'popup-overlay',
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      clickOnModal: false,
    };

    this.modalRef = React.createRef();
    this.overlayRef = React.createRef();
  }

  componentDidMount() {
    const { visible, disableBodyScroll } = this.props;

    if (visible) {
      this.addClickEvents();
    }

    if (disableBodyScroll) {
      bodyScroll.disable();
    }
  }

  componentDidUpdate() {
    const { visible } = this.props;

    if (visible) {
      this.addClickEvents();
    } else {
      this.removeClickEvents();
    }
  }

  componentWillUnmount() {
    this.removeClickEvents();

    const { disableBodyScroll } = this.props;

    if (disableBodyScroll) {
      bodyScroll.enable();
    }
  }

  handleEsc = event => {
    if (event.key === 'Escape') this.handleClose();
  };

  handleClose = () => {
    const { onClose } = this.props;

    if (onClose) onClose();
  };

  handleOverlayClick = () => {
    const { visible } = this.props;
    const { clickOnModal } = this.state;

    if (visible && !clickOnModal) {
      this.handleClose();
    }

    this.state.clickOnModal = false;
  };

  handleModalClick = () => {
    this.state.clickOnModal = true;
  };

  addClickEvents = () => {
    const modalDomNode = this.modalRef.current;
    const overlayDomNode = this.overlayRef.current;

    if (modalDomNode) modalDomNode.addEventListener('click', this.handleModalClick);
    if (overlayDomNode) overlayDomNode.addEventListener('click', this.handleOverlayClick);

    document.addEventListener('keydown', this.handleEsc);
  };

  removeClickEvents = () => {
    const modalDomNode = this.modalRef.current;
    const overlayDomNode = this.overlayRef.current;

    if (modalDomNode) modalDomNode.removeEventListener('click', this.handleModalClick);
    if (overlayDomNode) overlayDomNode.removeEventListener('click', this.handleOverlayClick);

    document.removeEventListener('keydown', this.handleEsc);
  };

  render() {
    const {
      title, children, visible, classNames
    } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div
        role="button"
        tabIndex={0}
        className={classNames.overlay}
        onKeyPress={this.onKeyPress}
        ref={this.overlayRef}
      >
        <section ref={this.modalRef}>
          {title ? (
            <header className="popup-title">
              <h2>{title}</h2>
              <button
                type="button"
                tabIndex={0}
                onClick={this.handleClose}
                className="btn btn-link close-link"
              >
                <i className="fa fa-times fa-lg" />
              </button>
            </header>
          ) : null}
          <div className="popup-content">{children}</div>
        </section>
      </div>
    );
  }
}
