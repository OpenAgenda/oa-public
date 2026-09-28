import React, { Component } from 'react';
import { defineMessages, IntlContext } from 'react-intl';
import * as bodyScroll from './body-scroll.js';
import ClickListener from './lib/ClickListener.js';
import Context from './lib/ModalContext.js';

const messages = defineMessages({
  close: {
    id: 'ReactShared.Modal.close',
    defaultMessage: 'Close',
  },
});

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Open modals, most recent last. Only the top one answers Escape and keeps
// Tab inside itself, so a modal opened from another one behaves on its own.
const openModals = [];

let lastId = 0;

function isDisplayed(element, container) {
  for (let el = element; el && el !== container; el = el.parentElement) {
    if (el.hidden || window.getComputedStyle(el).display === 'none') {
      return false;
    }
  }
  return window.getComputedStyle(element).visibility !== 'hidden';
}

function getFocusables(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter((el) =>
    isDisplayed(el, container));
}

/**
 * A modal dialog. It is exposed to assistive technologies as one
 * (`role="dialog"`, `aria-modal`, named by its title, or by `ariaLabel` when
 * it has none), takes focus when it opens and gives it back when it closes,
 * keeps Tab and Shift+Tab inside itself, and closes on Escape as it does on
 * a click outside.
 *
 * Tab is only turned back at the dialog's own edges: focus sitting outside it
 * — in a dropdown a child renders in a portal, say — is left alone. A child
 * that handles Escape or Tab itself and calls `preventDefault` (an open select
 * menu) keeps the key.
 */
export default class Modal extends Component {
  static contextType = IntlContext;

  static defaultProps = {
    title: null,
    visible: true,
    disableBodyScroll: false,
    onClose: null,
    classNames: {
      overlay: 'popup-overlay',
      title: 'popup-title',
    },
    contentRef: null,
    // The close button's accessible name. Defaults to the translated "Close"
    // when an IntlProvider is present, to English otherwise.
    closeLabel: null,
    // The dialog's accessible name when it has no `title`.
    ariaLabel: null,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();

    lastId += 1;
    this.titleId = `oa-modal-title-${lastId}`;

    this.handleClose = this.handleClose.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    const { visible, disableBodyScroll } = this.props;
    if (!visible) {
      return;
    }

    this.clickListener = ClickListener(this.ref.current, {
      onOutsideClick: () => this.handleClose(),
    });

    if (disableBodyScroll) {
      bodyScroll.disable();
    }

    this.activate();
  }

  componentDidUpdate() {
    const { visible, disableBodyScroll } = this.props;

    if (visible) {
      if (disableBodyScroll) {
        bodyScroll.disable();
      }

      if (!this.clickListener) {
        this.clickListener = ClickListener(this.ref.current, {
          onOutsideClick: () => this.handleClose(),
        });
      }

      this.activate();

      return;
    }

    if (this.clickListener) {
      this.clickListener.shutdown();
      this.clickListener = null;
    }

    if (disableBodyScroll) {
      bodyScroll.enable();
    }

    this.deactivate();
  }

  componentWillUnmount() {
    const { disableBodyScroll } = this.props;

    if (this.clickListener) {
      this.clickListener.shutdown();
    }

    if (disableBodyScroll) {
      bodyScroll.enable();
    }

    this.deactivate();
  }

  handleClose() {
    const { onClose, visible } = this.props;

    if (onClose && visible) {
      onClose();
    }
  }

  handleKeyDown(e) {
    if (e.defaultPrevented || openModals[openModals.length - 1] !== this) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this.handleClose();
      return;
    }

    if (e.key === 'Tab') {
      this.keepTabInside(e);
    }
  }

  // Focus goes in when the dialog opens, unless something inside already
  // took it (an `autoFocus` input); the element that had it is kept, to give
  // it back on close.
  activate() {
    const section = this.ref.current;

    if (this.active || !section) {
      return;
    }

    this.active = true;
    openModals.push(this);
    this.previousFocus = document.activeElement;
    document.addEventListener('keydown', this.handleKeyDown);

    if (!section.contains(document.activeElement)) {
      (getFocusables(section)[0] ?? section).focus();
    }
  }

  // Focus goes back to where it was before the dialog opened, if that element
  // is still in the page and focus has not moved elsewhere in the meantime.
  deactivate() {
    if (!this.active) {
      return;
    }

    this.active = false;
    openModals.splice(openModals.indexOf(this), 1);
    document.removeEventListener('keydown', this.handleKeyDown);

    const { activeElement } = document;
    const focusIsLost = !activeElement
      || activeElement === document.body
      || this.ref.current?.contains(activeElement);

    if (focusIsLost && this.previousFocus?.isConnected) {
      this.previousFocus.focus();
    }

    this.previousFocus = null;
  }

  keepTabInside(e) {
    const section = this.ref.current;
    const { activeElement } = document;

    if (!section) {
      return;
    }

    const focusables = getFocusables(section);
    const inside = section.contains(activeElement);
    const focusIsLost = !activeElement || activeElement === document.body;

    // Focus outside the dialog, in a portal for instance, is left alone.
    if (!inside && !focusIsLost) {
      return;
    }

    if (!focusables.length) {
      e.preventDefault();
      section.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (!inside) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    } else if (
      e.shiftKey
      && (activeElement === first || activeElement === section)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  render() {
    const {
      title,
      children,
      visible,
      classNames,
      contentRef,
      closeLabel,
      ariaLabel,
    } = this.props;
    const intl = this.context;

    if (!visible) {
      return null;
    }

    const contentProps = {
      className: 'popup-content',
    };

    if (contentRef) {
      contentProps.ref = contentRef;
    }

    const closeName = closeLabel
      ?? (intl
        ? intl.formatMessage(messages.close)
        : messages.close.defaultMessage);

    return (
      <Context.Provider value>
        <div
          className={classNames.overlay ?? 'popup-overlay'}
          ref={this.overlayRef}
        >
          <section
            ref={this.ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? this.titleId : undefined}
            aria-label={!title && ariaLabel ? ariaLabel : undefined}
            tabIndex={-1}
          >
            {title ? (
              <header className={classNames.title ?? 'popup-title'}>
                <h2 id={this.titleId}>{title}</h2>
                <button
                  type="button"
                  onClick={this.handleClose}
                  className="close-link"
                  aria-label={closeName}
                >
                  <i className="fa fa-times fa-lg" aria-hidden="true" />
                </button>
              </header>
            ) : null}
            <div {...contentProps}>{children}</div>
          </section>
        </div>
      </Context.Provider>
    );
  }
}
