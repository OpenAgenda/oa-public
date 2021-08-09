import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as bodyScroll from './body-scroll';

export default class Modal extends Component {
  static propTypes = {
    title: PropTypes.node,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    disableBodyScroll: PropTypes.bool,
    classNames: PropTypes.shape({ overlay: PropTypes.string }),
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
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
    this.ref = React.createRef();
  }

  componentDidUpdate = () => {
    if (this.props.visible) {
      this.addEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.disable();
      }
    } else {
      this.removeEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.enable();
      }
    }
  };

  addEvents = () => {
    document.addEventListener('keydown', this.handleEsc);
    document.addEventListener('click', this.handleOutsideClick);
  };

  removeEvents = () => {
    document.removeEventListener('keydown', this.handleEsc);
    document.removeEventListener('click', this.handleOutsideClick);
  };

  componentDidMount = () => {
    if (this.props.visible) {
      this.addEvents();

      if (this.props.disableBodyScroll) {
        bodyScroll.disable();
      }
    }
  };

  componentWillUnmount = () => {
    this.removeEvents();

    if (this.props.disableBodyScroll) {
      bodyScroll.enable();
    }
  };

  handleClose = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }
  };

  handleOutsideClick = e => {
    if (this.ref.current && !this.ref.current.contains(e.target) && !e.target.id.includes('react-select')) this.handleClose();
  }

  handleEsc = event => {
    if (event.key === 'Escape') this.handleClose();
  };

  render() {
    const {
      title, children, visible, classNames
    } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div className={classNames.overlay} ref={this.overlayRef}>
        <section ref={this.ref}>
          {title ? (
            <header className="popup-title">
              <h2>{title}</h2>
              <button type="button" onClick={this.handleClose} className="close-link" onKeyPress={this.onKeyPress}>
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
