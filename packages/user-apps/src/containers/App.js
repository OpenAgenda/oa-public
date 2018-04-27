"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  { connect } = require( 'react-redux' );


const App = createReactClass( {

  displayName: 'App',

  contextTypes: {
    getLabels: PropTypes.func
  },

  render() {

    const { getLabels } = this.context;

    return (
      <div className="container user-settings">
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <div className="top-margined wsq">
              <div className="content">
                <div className="header">
                  <h2>{getLabels( 'accountParameters' )}</h2>
                </div>

                {this.props.children}

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

} );

function mapStateToProps( { app: { loading } } ) {

  return { loading };

}

module.exports = connect( mapStateToProps )( App );