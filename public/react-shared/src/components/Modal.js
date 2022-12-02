import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as bodyScroll from './body-scroll';
import ClickListener from './lib/ClickListener';

export default class Modal extends Component {
  static propTypes = {
    title: PropTypes.node,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    disableBodyScroll: PropTypes.bool,
    classNames: PropTypes.shape({ overlay: PropTypes.string }),
    children: PropTypes.node.isRequired,
    contentRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Object) }), // Element is undefined in ssr
    ]),
  };

  static defaultProps = {
    title: null,
    visible: true,
    disableBodyScroll: false,
    onClose: null,
    classNames: {
      overlay: 'popup-overlay',
    },
    contentRef: null,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    const {
      visible,
      disableBodyScroll,
    } = this.props;
    if (!visible) {
      return;
    }

    this.clickListener = ClickListener(this.ref.current, {
      onOutsideClick: () => this.handleClose(),
    });

    if (disableBodyScroll) {
      bodyScroll.disable();
    }
  }

  componentDidUpdate() {
    const {
      visible,
      disableBodyScroll,
    } = this.props;

    if (visible) {
      if (disableBodyScroll) {
        bodyScroll.disable();
      }

      if (!this.clickListener) {
        this.clickListener = ClickListener(this.ref.current, {
          onOutsideClick: () => this.handleClose(),
        });
      }

      return;
    }

    if (this.clickListener) {
      this.clickListener.shutdown();
      this.clickListener = null;
    }

    if (disableBodyScroll) {
      bodyScroll.enable();
    }
  }

  componentWillUnmount() {
    const {
      disableBodyScroll,
    } = this.props;

    if (this.clickListener) {
      this.clickListener.shutdown();
    }

    if (disableBodyScroll) {
      bodyScroll.enable();
    }
  }

  handleClose() {
    const { onClose, visible } = this.props;

    if (onClose && visible) {
      onClose();
    }
  }

  render() {
    const {
      title, children, visible, classNames, contentRef,
    } = this.props;

    if (!visible) {
      return null;
    }

    const contentProps = {
      className: 'popup-content',
    };

    if (contentRef) {
      contentProps.ref = contentRef;
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
          <div {...contentProps}>{children}</div>
        </section>
      </div>
    );
  }
}
