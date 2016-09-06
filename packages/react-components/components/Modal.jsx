"use strict";

const React = require( 'react' ),

  ReactDOM = require( "react-dom" ),

  bodyScroll = require( './bodyScroll' );


const Modal = React.createClass( {

  displayName: 'Modal',

  propTypes: {
    title: React.PropTypes.string,
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    disableBodyScroll: React.PropTypes.bool
  },

  clickOnModal: false,

  getDefaultProps() {

    return {
      title: false,
      visible: true,
      disableBodyScroll: false,
      classNames: {
        overlay: 'popup-overlay'
      }
    };

  },

  componentDidUpdate() {

    if ( this.props.visible ) {

      this.addClickEvents();

    } else {

      this.removeClickEvents();

    }

  },

  addClickEvents() {

    ReactDOM.findDOMNode( this.modalRef ).addEventListener( 'click', this.handleModalClick );
    
    document.addEventListener( 'click', this.handleDocumentClick );

  },

  removeClickEvents() {

    ReactDOM.findDOMNode( this.modalRef ).removeEventListener( 'click', this.handleModalClick );
    
    document.removeEventListener( 'click', this.handleDocumentClick );

  },

  componentDidMount() {

    if ( this.props.disableBodyScroll ) bodyScroll.disable();

  },

  componentWillUnmount() {

    this.removeClickEvents();

    if ( this.props.disableBodyScroll ) bodyScroll.enable();

  },

  handleModalClick( e ) {

    this.clickOnModal = true;

  },

  handleDocumentClick( e ) {

    if ( this.props.visible && !this.clickOnModal ) {

      const area = ReactDOM.findDOMNode( this.modalRef );

      if ( !area.contains( e.target ) ) {
        this.handleClose();
      }

    }

    this.clickOnModal = false;
  },

  handleClose() {

    const { onClose } = this.props;

    if ( onClose ) onClose();

  },

  render() {

    const { visible, title, children } = this.props;

    return (
      <div style={{ display: visible ? 'block' : 'none' }} className={this.props.classNames.overlay}>
        <section ref={ref => this.modalRef = ref}>
         { title ? 
          <header className="popup-title">
            <h2>{title}</h2>
            <a onClick={this.handleClose} className="close-link">
              <i className="fa fa-times fa-lg"/>
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

} );

module.exports = Modal;