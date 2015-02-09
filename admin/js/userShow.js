"use strict";

var React = require( 'react' ),

remote = require( '../../js/lib/remote/remote.mod' );

module.exports = React.createClass({

  render: function() {

    var user = this.props.user,

    activationLink = '';

    if ( !user ) {

      return (
        <div>
          <p>Click on a user for details</p>
        </div>
      );

    }


    if ( !user.isActivated ) {

      activationLink = <span> - <a onClick={this.props.onUserActivation} href="#">activate</a></span>

    }

    return (
      <div>
        <h2>{user.fullName}</h2>
        <table className="table">
          <tr>
            <td>uid</td>
            <td>{user.uid}</td>
          </tr>
          <tr>
            <td>email</td>
            <td>{user.email}</td>
          </tr>
          <tr>
            <td>is activated?</td>
            <td>
              <span>{user.isActivated ? "yes" : "no"}</span>
              {activationLink}
            </td>
          </tr>
          <tr>
            <td>Created At</td>
            <td>{user.createdAt}</td>
          </tr>
          <tr>
            <td>Updated At</td>
            <td>{user.updatedAt}</td>
          </tr>
        </table>
      </div>
    );

  }

})