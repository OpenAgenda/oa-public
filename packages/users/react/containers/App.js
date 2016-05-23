"use strict";

const React = require( 'react' ),

  { connect } = require( 'react-redux' );


const App = React.createClass( {

  displayName: 'App',

  render() {

    return (
      <div className="container user-settings">
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <div className="top-margined wsq">
              <div className="content">
                <div className="header">
                  <h2>Paramètres du compte</h2>
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