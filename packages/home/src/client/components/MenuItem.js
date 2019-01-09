import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class MenuItem extends Component {

  render() {

    const { active, linkTo, onClick } = this.props;

    if ( active ) {

      return (
        <li className="active">
          <h2>{this.props.children}</h2>
        </li>
      );

    }

    return (
      <li>
        <Link to={linkTo} onClick={onClick}>{this.props.children}</Link>
      </li>
    );

  }

}
