"use strict";

const React = require( 'react' );


const Modal = React.createClass( {

  displayName: 'Modal',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func
  },

  getDefaultProps() {
    return { visible: false };
  },

  handleClose() {

    const { onClose } = this.props;

    if ( onClose ) onClose();

  },

  render() {

    const { visible, title, children } = this.props;

    return (
      <div style={{ display: visible ? 'block' : 'none' }} className="popup-overlay">
        <section>
          <header className="popup-title">
            <h2>{title}</h2>
            <a onClick={this.handleClose} className="close-link">
              <i className="fa fa-times fa-lg"/>
            </a>
          </header>
          <div className="popup-content">
            {children}
          </div>
        </section>
      </div>
    );

  }

} );

module.exports = Modal;